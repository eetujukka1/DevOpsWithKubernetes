const { Router } = require("express");

const { disableLiveness, getHealth } = require("../controllers/healthController");

const router = Router();

router.get("/", getHealth);
router.post("/disable", disableLiveness);

module.exports = router;
