/*==========================================
ATTENDANCE WIDGET
==========================================*/

function attendanceStatusMarkup(status){

    const map = {
        online:  { color: "#10B981", label: "Online"  },
        offline: { color: "#CBD5E1", label: "Offline" },
        absent:  { color: "#EF4444", label: "Absent"  }
    };

    const s = map[status] || map.offline;

    return `<span class="attendance-status"><span class="status-dot" style="background:${s.color}"></span>${s.label}</span>`;
}

function renderAttendanceTable(range){

    const thead = document.getElementById("attendanceTableHead");
    const tbody = document.getElementById("attendanceTableBody");

    if(!thead || !tbody) return;

    const rows = attendanceData[range] || [];

    if(range === "today"){

        thead.innerHTML = `
            <tr>
                <th>Staff</th>
                <th>Status</th>
                <th>Login</th>
                <th>Logout</th>
                <th>Hours</th>
            </tr>
        `;

        tbody.innerHTML = rows.map(r => `
            <tr>
                <td>${r.name}</td>
                <td>${attendanceStatusMarkup(r.status)}</td>
                <td>${r.login}${r.late ? ' <span class="late-tag">Late</span>' : ""}</td>
                <td>${r.logout}</td>
                <td>${r.hours}</td>
            </tr>
        `).join("");

    } else {

        thead.innerHTML = `
            <tr>
                <th>Staff</th>
                <th>Present</th>
                <th>Late</th>
                <th>Hours</th>
            </tr>
        `;

        tbody.innerHTML = rows.map(r => `
            <tr>
                <td>${r.name}</td>
                <td>${r.present}/${r.total} days</td>
                <td>${r.late ? r.late + " time" + (r.late > 1 ? "s" : "") : "—"}</td>
                <td>${r.hours}</td>
            </tr>
        `).join("");
    }
}

function renderAttendanceWidget(){

    const container = document.getElementById("attendanceWidget");

    if(!container) return;

    container.innerHTML = `
        <div class="schedule-widget attendance-widget">

            <div class="widget-header">
                <div>
                    <h2>Attendance</h2>
                    <p>Daily, weekly &amp; monthly staff attendance</p>
                </div>
                <select id="attendanceFilter" class="attendance-filter">
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>

            <div class="attendance-table-wrap">
                <table class="attendance-table">
                    <thead id="attendanceTableHead"></thead>
                    <tbody id="attendanceTableBody"></tbody>
                </table>
            </div>

            <div class="attendance-info">
                <h4>Admin can see:</h4>
                <ul>
                    <li>Daily attendance</li>
                    <li>Weekly attendance</li>
                    <li>Monthly attendance</li>
                    <li>Login/logout</li>
                    <li>Working hours</li>
                    <li>Online/offline</li>
                    <li>Late arrivals</li>
                    <li>Absence</li>
                </ul>
                <p>Staff see <strong>their own attendance</strong>.</p>
            </div>

        </div>
    `;

    const filter = document.getElementById("attendanceFilter");

    filter.addEventListener("change", () => renderAttendanceTable(filter.value));

    renderAttendanceTable("today");
}

document.addEventListener("DOMContentLoaded", renderAttendanceWidget);