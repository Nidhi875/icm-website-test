const express = require("express");
const router = express.Router();

const staffAuth = require("../controllers/staffAuthController");
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

// Login
router.post("/login", staffAuth.login);

// Staff directory
// Everyone logged in can VIEW the staff list
router.get("/", requireAuth, staffAuth.listStaff);

// Only administrators can ADD, EDIT or DELETE
router.post("/", requireAdmin, staffAuth.addStaff);
router.put("/:id", requireAdmin, staffAuth.updateStaff);
router.delete("/:id", requireAdmin, staffAuth.deleteStaff);

module.exports = router;