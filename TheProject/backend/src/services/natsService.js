const { connect } = require("@nats-io/transport-node");

const logger = require("../logger");

const DEFAULT_NATS_URL = "nats://my-nats.nats.svc.cluster.local:4222";
const DEFAULT_TODO_CREATED_SUBJECT = "todos.created";
const DEFAULT_CONNECT_TIMEOUT_MS = 2000;

const natsUrl = process.env.NATS_URL || DEFAULT_NATS_URL;
const todoCreatedSubject = process.env.NATS_TODO_CREATED_SUBJECT || DEFAULT_TODO_CREATED_SUBJECT;
const connectTimeoutMs = Number(process.env.NATS_CONNECT_TIMEOUT_MS) || DEFAULT_CONNECT_TIMEOUT_MS;
const natsEnabled = process.env.NATS_ENABLED !== "false";

let connection;
let connectionPromise;

const encodeJson = (payload) => Buffer.from(JSON.stringify(payload), "utf8");

const watchConnection = async (nc) => {
  const closeError = await nc.closed();

  if (connection === nc) {
    connection = undefined;
    connectionPromise = undefined;
  }

  if (closeError) {
    logger.warn("NATS connection closed with error", { error: closeError });
  } else {
    logger.info("NATS connection closed");
  }
};

const getConnection = async () => {
  if (!natsEnabled) {
    return undefined;
  }

  if (!connectionPromise) {
    connectionPromise = connect({
      servers: natsUrl,
      name: "the-project-backend",
      reconnect: true,
      maxReconnectAttempts: -1,
      timeout: connectTimeoutMs,
    })
      .then((nc) => {
        connection = nc;
        watchConnection(nc);
        logger.info("Connected to NATS", { natsUrl });
        return nc;
      })
      .catch((error) => {
        connectionPromise = undefined;
        logger.warn("Failed to connect to NATS", { error, natsUrl });
        throw error;
      });
  }

  return connectionPromise;
};

const publishTodoCreated = async (todo) => {
  const nc = await getConnection();

  if (!nc) {
    return;
  }

  nc.publish(
    todoCreatedSubject,
    encodeJson({
      event: "todo.created",
      todo,
    })
  );

  await nc.flush();
  logger.info("Published todo-created event to NATS", {
    subject: todoCreatedSubject,
    todoId: todo.id,
  });
};

const close = async () => {
  if (!connection) {
    return;
  }

  await connection.drain();
};

module.exports = {
  close,
  publishTodoCreated,
};
