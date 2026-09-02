/*==========================================
ATTENDANCE WIDGET
Real, functioning clock-in / clock-out
attendance tracking, backed by localStorage.
==========================================*/

/*----------------------
Small date/time helpers
----------------------*/

function attPad(n){
    return n < 10 ? "0" + n : "" + n;
}

function attFormatTime(date){
    return date.getHours() + ":" + attPad(date.getMinutes());
}

function attFormatHours(ms){
    if(ms <= 0) return "0h";
    const totalMinutes = Math.floor(ms / 60000);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if(h === 0) return m + "m";
    if(m === 0) return h + "h";
    return h + "h " + m + "m";
}

function attDateKey(date){
    return date.getFullYear() + "-" + attPad(date.getMonth() + 1) + "-" + attPad(date.getDate());
}

/*----------------------
Storage
----------------------*/

function attLoadRecords(){
    try {
        return JSON.parse(localStorage.getItem(ATTENDANCE_CONFIG.storageKey)) || {};
    } catch(e){
        return {};
    }
}

function attSaveRecords(records){
    localStorage.setItem(ATTENDANCE_CONFIG.storageKey, JSON.stringify(records));
}

function attGetTodayRecord(staffId){
    const records = attLoadRecords();
    const today = attDateKey(new Date());
    return (records[today] && records[today][staffId]) || null;
}

/*----------------------
Clock in / out actions
----------------------*/

function attClockIn(staffId){
    const records = attLoadRecords();
    const today = attDateKey(new Date());
    records[today] = records[today] || {};

    if(records[today][staffId] && records[today][staffId].loginTs){
        return false; // already clocked in today
    }

    const now = new Date();
    records[today][staffId] = {
        loginTs: now.getTime(),
        login: attFormatTime(now),
        logoutTs: null,
        logout: null
    };

    attSaveRecords(records);
    return true;
}

function attClockOut(staffId){
    const records = attLoadRecords();
    const today = attDateKey(new Date());
    const rec = records[today] && records[today][staffId];

    if(!rec || !rec.loginTs || rec.logoutTs) return false;

    const now = new Date();
    rec.logoutTs = now.getTime();
    rec.logout = attFormatTime(now);

    attSaveRecords(records);
    return true;
}

/*----------------------
Derived values
----------------------*/

function attIsLate(rec){
    if(!rec || !rec.loginTs) return false;
    const d = new Date(rec.loginTs);
    const minutes = d.getHours() * 60 + d.getMinutes();
    return minutes > ATTENDANCE_CONFIG.lateThresholdMinutes;
}

function attStatusForToday(rec){
    if(!rec || !rec.loginTs) return "absent";
    if(!rec.logoutTs) return "online";
    return "offline";
}

function attHoursForToday(rec){
    if(!rec || !rec.loginTs) return "0h";
    const end = rec.logoutTs || Date.now();
    return attFormatHours(end - rec.loginTs);
}

function attAggregate(staffId, days){
    const records = attLoadRecords();
    const now = new Date();
    const todayKey = attDateKey(now);

    let present = 0, late = 0, totalMs = 0;

    for(let i = 0; i < days; i++){
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = attDateKey(d);
        const rec = records[key] && records[key][staffId];

        if(rec && rec.loginTs){
            present++;
            if(attIsLate(rec)) late++;
            const end = rec.logoutTs || (key === todayKey ? Date.now() : rec.loginTs);
            totalMs += Math.max(0, end - rec.loginTs);
        }
    }

    return { present: present, total: days, late: late, hours: attFormatHours(totalMs) };
}

/*----------------------
Rendering
----------------------*/

function attendanceStatusMarkup(status){
    const map = {
        online:  { color: "#10B981", label: "Online"  },
        offline: { color: "#CBD5E1", label: "Offline" },
        absent:  { color: "#EF4444", label: "Absent"  }
    };
    const s = map[status] || map.offline;
    return '<span class="attendance-status"><span class="status-dot" style="background:' + s.color + '"></span>' + s.label + '</span>';
}

function renderAttendanceTable(range){
    const thead = document.getElementById("attendanceTableHead");
    const tbody = document.getElementById("attendanceTableBody");
    if(!thead || !tbody) return;

    if(range === "today"){
        thead.innerHTML =
            '<tr><th>Staff</th><th>Status</th><th>Login</th><th>Logout</th><th>Hours</th></tr>';

        tbody.innerHTML = ATTENDANCE_STAFF.map(function(staff){
            const rec = attGetTodayRecord(staff.id);
            const status = attStatusForToday(rec);
            const login = (rec && rec.login) ? rec.login : "—";
            const logout = (rec && rec.logout) ? rec.logout : "—";
            const hours = attHoursForToday(rec);
            const late = attIsLate(rec);

            return '<tr>' +
                '<td>' + staff.name + '</td>' +
                '<td>' + attendanceStatusMarkup(status) + '</td>' +
                '<td>' + login + (late ? ' <span class="late-tag">Late</span>' : '') + '</td>' +
                '<td>' + logout + '</td>' +
                '<td>' + hours + '</td>' +
                '</tr>';
        }).join("");

    } else {
        const days = range === "week" ? 7 : 30;

        thead.innerHTML = '<tr><th>Staff</th><th>Present</th><th>Late</th><th>Hours</th></tr>';

        tbody.innerHTML = ATTENDANCE_STAFF.map(function(staff){
            const agg = attAggregate(staff.id, days);
            return '<tr>' +
                '<td>' + staff.name + '</td>' +
                '<td>' + agg.present + '/' + agg.total + ' days</td>' +
                '<td>' + (agg.late ? agg.late + ' time' + (agg.late > 1 ? 's' : '') : '—') + '</td>' +
                '<td>' + agg.hours + '</td>' +
                '</tr>';
        }).join("");
    }
}

function renderAttendanceWidget(){
    const container = document.getElementById("attendanceWidget");
    if(!container) return;

    container.innerHTML =
        '<div class="schedule-widget attendance-widget">' +
            '<div class="widget-header">' +
                '<div>' +
                    '<h2>Attendance</h2>' +
                    '<p>Daily, weekly &amp; monthly staff attendance</p>' +
                '</div>' +
                '<select id="attendanceFilter" class="attendance-filter">' +
                    '<option value="today">Today</option>' +
                    '<option value="week">This Week</option>' +
                    '<option value="month">This Month</option>' +
                '</select>' +
            '</div>' +

            '<div class="attendance-clock-bar">' +
                '<label for="attendanceStaffSelect">Clock in/out as</label>' +
                '<select id="attendanceStaffSelect" class="attendance-filter"></select>' +
                '<button type="button" id="attendanceClockInBtn" class="primary-btn small">Clock In</button>' +
                '<button type="button" id="attendanceClockOutBtn" class="primary-btn small">Clock Out</button>' +
                '<span id="attendanceClockMsg" class="attendance-clock-msg"></span>' +
            '</div>' +

            '<div class="attendance-table-wrap">' +
                '<table class="attendance-table">' +
                    '<thead id="attendanceTableHead"></thead>' +
                    '<tbody id="attendanceTableBody"></tbody>' +
                '</table>' +
            '</div>' +

            '<div class="attendance-info">' +
                '<h4>Admin can see:</h4>' +
                '<ul>' +
                    '<li>Daily attendance</li>' +
                    '<li>Weekly attendance</li>' +
                    '<li>Monthly attendance</li>' +
                    '<li>Login/logout</li>' +
                    '<li>Working hours</li>' +
                    '<li>Online/offline</li>' +
                    '<li>Late arrivals</li>' +
                    '<li>Absence</li>' +
                '</ul>' +
                '<p>Staff see <strong>their own attendance</strong>.</p>' +
            '</div>' +
        '</div>';

    const staffSelect = document.getElementById("attendanceStaffSelect");
    staffSelect.innerHTML = ATTENDANCE_STAFF.map(function(s){
        return '<option value="' + s.id + '">' + s.name + '</option>';
    }).join("");

    const filter = document.getElementById("attendanceFilter");
    filter.addEventListener("change", function(){
        renderAttendanceTable(filter.value);
    });

    const clockInBtn = document.getElementById("attendanceClockInBtn");
    const clockOutBtn = document.getElementById("attendanceClockOutBtn");
    const msg = document.getElementById("attendanceClockMsg");

    clockInBtn.addEventListener("click", function(){
        const staffId = staffSelect.value;
        const ok = attClockIn(staffId);
        msg.textContent = ok ? "Clocked in at " + attFormatTime(new Date()) + "." : "Already clocked in today.";
        renderAttendanceTable(filter.value);
    });

    clockOutBtn.addEventListener("click", function(){
        const staffId = staffSelect.value;
        const rec = attGetTodayRecord(staffId);
        if(!rec || !rec.loginTs){
            msg.textContent = "Not clocked in yet today.";
            return;
        }
        const ok = attClockOut(staffId);
        msg.textContent = ok ? "Clocked out at " + attFormatTime(new Date()) + "." : "Already clocked out today.";
        renderAttendanceTable(filter.value);
    });

    renderAttendanceTable("today");

    // Keep "today" hours ticking upward for anyone still clocked in
    if(window.__attendanceInterval) clearInterval(window.__attendanceInterval);
    window.__attendanceInterval = setInterval(function(){
        if(filter.value === "today") renderAttendanceTable("today");
    }, 30000);
}

document.addEventListener("DOMContentLoaded", renderAttendanceWidget);