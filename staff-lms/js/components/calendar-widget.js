/*==================================================
  GOULDINGS STAFF LMS
  DASHBOARD CALENDAR WIDGET
==================================================*/

console.log("Calendar Widget JS Loaded");

function initCalendarWidget() {

    const monthSelect = document.getElementById("monthSelect");
    const yearSelect = document.getElementById("yearSelect");
    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");
    const todayBtn = document.getElementById("todayBtn");
    const calendarGrid = document.getElementById("calendarGrid");
    const calendarUserFilter = document.getElementById("calendarUserFilter");

    if (
        !monthSelect ||
        !yearSelect ||
        !prevMonth ||
        !nextMonth ||
        !todayBtn ||
        !calendarGrid
    ) {
        return;
    }

    let currentDate = new Date();
    function formatDate(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    function getMeetings(date) {
        try {
            const selectedUser = calendarUserFilter?.value || "all";
            return JSON.parse(localStorage.getItem("ops_events") || "[]").filter(event => event.date === date && (selectedUser === "all" || event.staff === selectedUser));
        } catch {
            return [];
        }
    }

    /*=========================================
      Populate Year Dropdown
    =========================================*/

    yearSelect.innerHTML = "";

    for (let year = 2020; year <= 2035; year++) {

        const option = document.createElement("option");

        option.value = year;
        option.textContent = year;

        yearSelect.appendChild(option);

    }

    /*=========================================
      Render Calendar
    =========================================*/

    function renderCalendar() {

        calendarGrid.innerHTML = "";

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthSelect.value = month;
        yearSelect.value = year;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const prevMonthDays = new Date(year, month, 0).getDate();

        /* Previous Month */

        for (let i = firstDay; i > 0; i--) {

            const day = document.createElement("div");

            day.className = "day inactive";

            day.innerHTML = `
                <div class="date-number">${prevMonthDays - i + 1}</div>
            `;

            calendarGrid.appendChild(day);

        }

        /* Current Month */

        const today = new Date();

        for (let d = 1; d <= daysInMonth; d++) {

            const day = document.createElement("div");

    
            day.className = "calendar-widget-day";

            if (
                d === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                day.classList.add("today");
            }
            const date = formatDate(year, month, d);
            const meetings = getMeetings(date);
            day.dataset.date = date;
            day.innerHTML = `
                <div class="date-number">${d}</div>
                <div class="calendar-meetings">${meetings.slice(0, 2).map(meeting => `<span class="calendar-meeting" title="${meeting.title}">${meeting.title}</span>`).join("")}</div>
            `;
            day.addEventListener("click", () => {
                document.dispatchEvent(new CustomEvent("calendarWidget:dateSelected", { detail: { date } }));
            });

            calendarGrid.appendChild(day);

        }

        /* Next Month */

        while (calendarGrid.children.length < 42) {

            const day = document.createElement("div");

        
            day.className = "calendar-widget-day inactive";

            day.innerHTML = `
                <div class="date-number">
                    ${calendarGrid.children.length - (firstDay + daysInMonth) + 1}
                </div>
            `;

            calendarGrid.appendChild(day);

        }

    }

    /*=========================================
      Navigation
    =========================================*/

    prevMonth.onclick = function () {

        currentDate.setMonth(currentDate.getMonth() - 1);

        renderCalendar();

    };

    nextMonth.onclick = function () {

        currentDate.setMonth(currentDate.getMonth() + 1);

        renderCalendar();

    };

    monthSelect.onchange = function () {

        currentDate.setMonth(parseInt(this.value));

        renderCalendar();

    };

    yearSelect.onchange = function () {

        currentDate.setFullYear(parseInt(this.value));

        renderCalendar();

    };
    calendarUserFilter?.addEventListener("change", renderCalendar);


    todayBtn.onclick = function () {

        currentDate = new Date();

        renderCalendar();

    };



    window.addEventListener("opsEventsChanged", renderCalendar);

    renderCalendar();

}

window.initCalendarWidget = initCalendarWidget;

