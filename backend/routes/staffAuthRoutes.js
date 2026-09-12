const express = require("express");
const router = express.Router();

const staffAuth = require("../controllers/staffAuthController");


const requireStaffAuth = require("../middleware/requireAuth");

router.post("/login", staffAuth.login);

router.get("/profile", requireStaffAuth, staffAuth.getProfile);
router.put("/profile", requireStaffAuth, staffAuth.updateProfile);
router.put("/change-password", requireStaffAuth, staffAuth.changePassword);

module.exports = router;