const express = require("express");
const router = express.Router();

const staffAuth = require("../controllers/staffAuthController");

const requireStaffAuth = require("../middleware/requireAuth");

// ==========================================================
// LOGIN
// ==========================================================

router.post("/login", staffAuth.login);

// ==========================================================
// STAFF DIRECTORY
// ==========================================================

// Any authenticated staff member can VIEW the staff directory
router.get("/", requireStaffAuth, staffAuth.listStaff);

// ==========================================================
// PROFILE
// ==========================================================

router.get("/profile", requireStaffAuth, staffAuth.getProfile);

router.put("/profile", requireStaffAuth, staffAuth.updateProfile);

router.put(
    "/change-password",
    requireStaffAuth,
    staffAuth.changePassword
);

module.exports = router;