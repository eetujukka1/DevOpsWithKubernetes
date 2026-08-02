const DEFAULT_LOKI_URL = "http://loki-gateway.monitoring.svc.cluster.local/loki/api/v1/push";
const DEFAULT_LOKI_TENANT_ID = "1";
const ONE_MILLION = 1000000n;

const lokiUrl = process.env.LOKI_URL || DEFAULT_LOKI_URL;
const lokiTenantId = process.env.LOKI_TENANT_ID || DEFAULT_LOKI_TENANT_ID;
const lokiEnabled = process.env.LOKI_ENABLED !== "false" && Boolean(lokiUrl);
const lokiTimeoutMs = Number(process.env.LOKI_TIMEOUT_MS) || 2000;
const serviceName = process.env.LOKI_SERVICE_NAME || "the-project-backend";

const inFlight = new Set();

const toLokiTimestamp = () => (BigInt(Date.now()) * ONE_MILLION).toString();

const serializeError = (error) => {
  if (!(error instanceof Error)) {
    return error;
  }

  return {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };
};

const serializeMeta = (meta = {}) =>
  Object.fromEntries(
    Object.entries(meta)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, serializeError(value)])
  );

const writeToConsole = (level, message, meta) => {
  const payload = { level, message, ...serializeMeta(meta) };
  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
};

const sendToLoki = (level, message, meta) => {
  if (!lokiEnabled) {
    return Promise.resolve();
  }

  const payload = {
    streams: [
      {
        stream: {
          app: "the-project",
          component: "backend",
          service: serviceName,
          level,
        },
        values: [
          [
            toLokiTimestamp(),
            JSON.stringify({
              timestamp: new Date().toISOString(),
              level,
              message,
              ...serializeMeta(meta),
            }),
          ],
        ],
      },
    ],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), lokiTimeoutMs);
  timeout.unref?.();

  return fetch(lokiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Scope-OrgID": lokiTenantId,
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Loki responded with ${response.status}`);
      }
    })
    .catch((error) => {
      console.error(
        JSON.stringify({
          level: "error",
          message: "Failed to send log entry to Loki",
          error: serializeError(error),
        })
      );
    })
    .finally(() => {
      clearTimeout(timeout);
    });
};

const log = (level, message, meta = {}) => {
  writeToConsole(level, message, meta);

  const pending = sendToLoki(level, message, meta);
  inFlight.add(pending);
  pending.finally(() => inFlight.delete(pending));

  return pending;
};

const requestLogger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    log(level, "HTTP request completed", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      userAgent: req.get("user-agent"),
    });
  });

  next();
};

const flush = async () => {
  await Promise.allSettled(Array.from(inFlight));
};

module.exports = {
  flush,
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
  requestLogger,
};
