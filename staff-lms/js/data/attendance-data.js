/*==================================================
    ATTENDANCE DATA
    Staff roster + settings for the Attendance widget.
    Actual attendance records (login/logout times) are
    NOT hardcoded here — they're written for real by
    attendance-widget.js into localStorage whenever
    someone clocks in/out, then read back to build the
    table. This file only defines who can be tracked
    and the rules used to judge their records.
==================================================*/

const ATTENDANCE_STAFF = [
    { id: "derrick", name: "Derrick" },
    { id: "claire",  name: "Claire"  },
    { id: "joy",     name: "Joy"     },
    { id: "arnab",   name: "Arnab"   },
    { id: "Nidhi",   name: "Nidhi"   },
];

const ATTENDANCE_CONFIG = {
    // Clock-ins after this time of day count as "Late"
    lateThresholdMinutes: 9 * 60 + 10, // 9:10 AM

    // Where records are persisted in the browser
    storageKey: "lms_attendance_records"
};