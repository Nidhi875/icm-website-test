const express = require("express");
const router = express.Router();

const staffAuth = require("../controllers/staffAuthController");
const requireAdmin = require("../middleware/requireAdmin");

// Existing — unprotected, anyone with correct credentials can log in
router.post("/login", staffAuth.login);

// New — staff directory management, Administrators only
router.get("/", requireAdmin, staffAuth.listStaff);
router.post("/", requireAdmin, staffAuth.addStaff);
router.put("/:id", requireAdmin, staffAuth.updateStaff);
router.delete("/:id", requireAdmin, staffAuth.deleteStaff);

module.exports = router;