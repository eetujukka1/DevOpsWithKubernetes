const fs = require("fs/promises");
const path = require("path");
const { connect } = require("@nats-io/transport-node");

const DEFAULT_NATS_URL = "nats://my-nats.nats.svc.cluster.local:4222";
const DEFAULT_TODO_CREATED_SUBJECT = "todos.created";
const DEFAULT_LOG_FILE_PATH = "/tmp/broadcaster/todo-events.log";
const DEFAULT_RECONNECT_DELAY_MS = 2000;
const DEFAULT_CONNECT_TIMEOUT_MS = 2000;
const DEFAULT_SLACK_TIMEOUT_MS = 5000;

const natsUrl = process.env.NATS_URL || DEFAULT_NATS_URL;
const subject = process.env.NATS_TODO_CREATED_SUBJECT || DEFAULT_TODO_CREATED_SUBJECT;
const queueGroup = process.env.NATS_QUEUE_GROUP || "todo-broadcasters";
const logFilePath = process.env.BROADCASTER_LOG_FILE_PATH || DEFAULT_LOG_FILE_PATH;
const reconnectDelayMs = Number(process.env.NATS_RECONNECT_DELAY_MS) || DEFAULT_RECONNECT_DELAY_MS;
const connectTimeoutMs = Number(process.env.NATS_CONNECT_TIMEOUT_MS) || DEFAULT_CONNECT_TIMEOUT_MS;
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
const slackTimeoutMs = Number(process.env.SLACK_TIMEOUT_MS) || DEFAULT_SLACK_TIMEOUT_MS;

let connection;
let shuttingDown = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const log = (level, message, meta = {}) => {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta }));
};

const truncate = (value, maxLength) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
};

const buildSlackMessage = (payload) => {
  const todo = payload?.todo;
  const todoText = truncate(todo?.text || "New todo created", 3000);
  const createdAt = todo?.createdAt ? `Created at: ${todo.createdAt}` : undefined;

  return {
    text: `New todo: ${todoText}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: `New todo: ${todoText}`,
          emoji: true,
        },
      },
      ...(createdAt
        ? [
            {
              type: "context",
              elements: [
                {
                  type: "plain_text",
                  text: createdAt,
                  emoji: true,
                },
              ],
            },
          ]
        : []),
    ],
  };
};

const postTodoToSlack = async (payload) => {
  if (!slackWebhookUrl) {
    log("debug", "Skipping Slack notification because SLACK_WEBHOOK_URL is not configured");
    return;
  }

  const response = await fetch(slackWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildSlackMessage(payload)),
    signal: AbortSignal.timeout(slackTimeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook returned ${response.status}`);
  }

  log("info", "Posted todo event to Slack", { todoId: payload?.todo?.id });
};

const processTodo = async (msg) => {
  const rawPayload = Buffer.from(msg.data).toString("utf8");
  let payload;

  try {
    payload = JSON.parse(rawPayload);
  } catch (error) {
    payload = { rawPayload, parseError: error.message };
  }

  const entry = {
    timestamp: new Date().toISOString(),
    subject: msg.subject,
    payload,
  };
  const line = `${JSON.stringify(entry)}\n`;

  await fs.mkdir(path.dirname(logFilePath), { recursive: true });
  await fs.appendFile(logFilePath, line, "utf8");
  log("info", "Recorded todo event", { subject: msg.subject, logFilePath });

  try {
    await postTodoToSlack(payload);
  } catch (error) {
    log("warn", "Failed to post todo event to Slack", {
      error: error.message,
      todoId: payload?.todo?.id,
    });
  }
};

const listen = async () => {
  while (!shuttingDown) {
    try {
      connection = await connect({
        servers: natsUrl,
        name: "the-project-broadcaster",
        reconnect: true,
        maxReconnectAttempts: -1,
        timeout: connectTimeoutMs,
      });

      log("info", "Connected to NATS", {
        natsUrl,
        subject,
        queueGroup,
        logFilePath,
        slackEnabled: Boolean(slackWebhookUrl),
      });

      const subscription = connection.subscribe(subject, { queue: queueGroup });

      for await (const msg of subscription) {
        await processTodo(msg);
      }

      const closeError = await connection.closed();

      if (closeError && !shuttingDown) {
        log("warn", "NATS connection closed with error", { error: closeError.message });
      }
    } catch (error) {
      if (!shuttingDown) {
        log("warn", "Failed to listen for NATS messages", {
          error: error.message,
          natsUrl,
          retryInMs: reconnectDelayMs,
        });
        await sleep(reconnectDelayMs);
      }
    } finally {
      connection = undefined;
    }
  }
};

const shutdown = async () => {
  shuttingDown = true;
  log("info", "Broadcaster shutting down");

  if (connection) {
    await connection.drain();
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

listen().catch((error) => {
  log("error", "Broadcaster stopped unexpectedly", { error: error.message });
  process.exit(1);
});
