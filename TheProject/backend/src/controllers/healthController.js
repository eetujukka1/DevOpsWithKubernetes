const prisma = require("../db/prisma");

let isLivenessEnabled = true;

const getHealth = async (_req, res) => {
  if (!isLivenessEnabled) {
    return res.status(503).json({
      ok: false,
      checks: {
        liveness: "disabled",
      },
    });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.json({
      ok: true,
      checks: {
        liveness: "enabled",
        database: "ok",
      },
    });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      checks: {
        liveness: "enabled",
        database: "unavailable",
      },
    });
  }
};

const disableLiveness = (_req, res) => {
  isLivenessEnabled = false;

  return res.json({
    ok: true,
    livenessEnabled: isLivenessEnabled,
  });
};

module.exports = { disableLiveness, getHealth };
