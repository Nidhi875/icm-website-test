const express = require("express");

const router = express.Router();

const attendanceController =
    require("../controllers/attendanceController");

const requireAdmin =
    require("../middleware/requireAdmin");


/*
    Staff login
*/
router.post(
    "/login",
    attendanceController.loginAttendance
);


/*
    Staff heartbeat
*/
router.post(
    "/heartbeat",
    attendanceController.heartbeat
);


/*
    Staff logout
*/
router.post(
    "/logout",
    attendanceController.logoutAttendance
);


/*
    Admin — today's attendance
*/
router.get(
    "/today",
    requireAdmin,
    attendanceController.getToday
);


/*
    Admin — weekly attendance
*/
router.get(
    "/week",
    requireAdmin,
    attendanceController.getWeekly
);


/*
    Admin — monthly attendance
*/
router.get(
    "/month",
    requireAdmin,
    attendanceController.getMonthly
);


/*
    Staff — own attendance
*/
router.get(
    "/my/:staffId",
    attendanceController.getMyAttendance
);


module.exports = router;