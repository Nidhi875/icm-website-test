const express = require("express");
const router = express.Router();

const staffAuth = require("../controllers/staffAuthController");

router.post("/login", staffAuth.login);

module.exports = router;