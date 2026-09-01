/*==================================================
    ATTENDANCE DATA
    Standalone dataset for the Dashboard Attendance
    widget. Not linked to Operations staff data.
==================================================*/

const attendanceData = {

    today: [
        { name: "Derrick", status: "online",  login: "9:02", logout: "—",     hours: "7h 12m", late: false },
        { name: "Claire",  status: "online",  login: "9:15", logout: "—",     hours: "6h 59m", late: true  },
        { name: "Joy",     status: "offline", login: "9:05", logout: "17:03", hours: "8h",      late: false },
        { name: "Arnab",   status: "absent",  login: "—",    logout: "—",     hours: "0h",      late: false }
    ],

    week: [
        { name: "Derrick", present: 5, total: 5, late: 0, hours: "36h 40m" },
        { name: "Claire",  present: 5, total: 5, late: 2, hours: "34h 10m" },
        { name: "Joy",     present: 4, total: 5, late: 0, hours: "31h 55m" },
        { name: "Arnab",   present: 3, total: 5, late: 1, hours: "22h 05m" }
    ],

    month: [
        { name: "Derrick", present: 21, total: 22, late: 1, hours: "151h 20m" },
        { name: "Claire",  present: 20, total: 22, late: 6, hours: "142h 45m" },
        { name: "Joy",     present: 19, total: 22, late: 0, hours: "138h 10m" },
        { name: "Arnab",   present: 15, total: 22, late: 4, hours: "98h 30m"  }
    ]

};