/*==================================================
    ATTENDANCE DATA
    Config only. The staff roster is NOT hardcoded
    here anymore — attendance-widget.js now reads the
    real logged-in person from localStorage (set by
    js/auth/login.js: staffId / staffName / staffRole)
    and builds the admin roster dynamically from whoever
    has actually clocked in/out before.
==================================================*/

const ATTENDANCE_CONFIG = {
    // Clock-ins after this time of day count as "Late"
    lateThresholdMinutes: 9 * 60 + 10, // 9:10 AM

    // Where records are persisted in the browser
    storageKey: "lms_attendance_records",

    // localStorage keys written by js/auth/login.js
    authKeys: {
        loggedIn: "staffLoggedIn",
        staffId: "staffId",
        staffName: "staffName",
        staffRole: "staffRole"
    },

    // Role value(s) that count as admin (lowercased)
    adminRoles: ["admin", "administrator"]
};