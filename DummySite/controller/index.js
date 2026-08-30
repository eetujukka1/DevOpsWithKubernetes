const crypto = require("crypto");
const k8s = require("@kubernetes/client-node");

const GROUP = "stable.dwk";
const VERSION = "v1";
const PLURAL = "dummysites";
const KIND = "DummySite";

const SITE_IMAGE = process.env.SITE_IMAGE || "dummysite:latest";
const IMAGE_PULL_POLICY = process.env.SITE_IMAGE_PULL_POLICY || "IfNotPresent";
const WATCH_RESTART_DELAY_MS = Number(process.env.WATCH_RESTART_DELAY_MS) || 5_000;

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const customObjectsApi = kc.makeApiClient(k8s.CustomObjectsApi);
const appsApi = kc.makeApiClient(k8s.AppsV1Api);
const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const watch = new k8s.Watch(kc);

async function main() {
  await reconcileAll();
  startWatch();
}

async function reconcileAll() {
  const response = await customObjectsApi.listClusterCustomObject(
    GROUP,
    VERSION,
    PLURAL,
  );
  const sites = unwrap(response).items || [];

  for (const site of sites) {
    await reconcileSite(site);
  }
}

async function startWatch() {
  try {
    await watch.watch(
      `/apis/${GROUP}/${VERSION}/${PLURAL}`,
      {},
      async (type, site) => {
        try {
          if (type === "ADDED" || type === "MODIFIED") {
            await reconcileSite(site);
            return;
          }

          if (type === "DELETED") {
            console.log(`Deleted ${site.metadata.namespace}/${site.metadata.name}`);
          }
        } catch (error) {
          console.error(
            `Failed to handle ${type} for ${site.metadata.namespace}/${site.metadata.name}:`,
            messageFor(error),
          );
        }
      },
      (error) => {
        if (error) {
          console.error("Watch ended:", messageFor(error));
        }

        setTimeout(startWatch, WATCH_RESTART_DELAY_MS);
      },
    );
  } catch (error) {
    console.error("Failed to start watch:", messageFor(error));
    setTimeout(startWatch, WATCH_RESTART_DELAY_MS);
  }
}

async function reconcileSite(site) {
  const namespace = site.metadata.namespace;
  const websiteUrl = site.spec && site.spec.website_url;

  if (!websiteUrl) {
    console.warn(`${namespace}/${site.metadata.name} has no spec.website_url`);
    return;
  }

  const name = workloadName(site.metadata.name);
  const labels = {
    "app.kubernetes.io/name": "dummy-site",
    "app.kubernetes.io/managed-by": "dummysite-controller",
    "dummysite.stable.dwk/site": name,
  };

  await upsertDeployment(namespace, name, deploymentFor(site, name, labels, websiteUrl));
  await upsertService(namespace, name, serviceFor(site, name, labels));

  console.log(`Reconciled ${namespace}/${site.metadata.name}`);
}

function deploymentFor(site, name, labels, websiteUrl) {
  return {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: childMetadata(site, name, labels),
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          "dummysite.stable.dwk/site": labels["dummysite.stable.dwk/site"],
        },
      },
      template: {
        metadata: {
          labels,
        },
        spec: {
          containers: [
            {
              name: "dummy-site",
              image: SITE_IMAGE,
              imagePullPolicy: IMAGE_PULL_POLICY,
              env: [
                {
                  name: "URL",
                  value: websiteUrl,
                },
              ],
              ports: [
                {
                  name: "http",
                  containerPort: 3000,
                },
              ],
            },
          ],
        },
      },
    },
  };
}

function serviceFor(site, name, labels) {
  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: childMetadata(site, name, labels),
    spec: {
      type: "ClusterIP",
      selector: {
        "dummysite.stable.dwk/site": labels["dummysite.stable.dwk/site"],
      },
      ports: [
        {
          name: "http",
          port: 80,
          targetPort: "http",
        },
      ],
    },
  };
}

function childMetadata(site, name, labels) {
  return {
    name,
    namespace: site.metadata.namespace,
    labels,
    ownerReferences: [
      {
        apiVersion: `${GROUP}/${VERSION}`,
        kind: KIND,
        name: site.metadata.name,
        uid: site.metadata.uid,
        controller: true,
      },
    ],
  };
}

async function upsertDeployment(namespace, name, desired) {
  try {
    const existing = unwrap(await appsApi.readNamespacedDeployment(name, namespace));
    desired.metadata.resourceVersion = existing.metadata.resourceVersion;
    await appsApi.replaceNamespacedDeployment(name, namespace, desired);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }

    await appsApi.createNamespacedDeployment(namespace, desired);
  }
}

async function upsertService(namespace, name, desired) {
  try {
    const existing = unwrap(await coreApi.readNamespacedService(name, namespace));
    desired.metadata.resourceVersion = existing.metadata.resourceVersion;

    if (existing.spec.clusterIP) {
      desired.spec.clusterIP = existing.spec.clusterIP;
    }
    if (existing.spec.clusterIPs) {
      desired.spec.clusterIPs = existing.spec.clusterIPs;
    }
    if (existing.spec.ipFamilies) {
      desired.spec.ipFamilies = existing.spec.ipFamilies;
    }
    if (existing.spec.ipFamilyPolicy) {
      desired.spec.ipFamilyPolicy = existing.spec.ipFamilyPolicy;
    }

    await coreApi.replaceNamespacedService(name, namespace, desired);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }

    await coreApi.createNamespacedService(namespace, desired);
  }
}

function workloadName(resourceName) {
  const cleaned = `dummysite-${resourceName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "");

  if (cleaned.length <= 63) {
    return cleaned;
  }

  const hash = crypto.createHash("sha256").update(resourceName).digest("hex").slice(0, 8);
  return `${cleaned.slice(0, 54)}-${hash}`;
}

function unwrap(response) {
  return response.body || response;
}

function isNotFound(error) {
  return (
    error.statusCode === 404 ||
    error.response?.statusCode === 404 ||
    error.body?.code === 404
  );
}

function messageFor(error) {
  return error.body?.message || error.message || String(error);
}

main().catch((error) => {
  console.error(messageFor(error));
  process.exit(1);
});
