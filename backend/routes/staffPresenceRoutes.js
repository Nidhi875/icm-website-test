const router = require("express").Router();

const {
    heartbeat,
    getPresence
} = require("../controllers/staffPresenceController");

router.post("/heartbeat", heartbeat);

router.get("/", getPresence);

module.exports = router;