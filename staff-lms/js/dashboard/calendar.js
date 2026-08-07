/*==========================================
CALENDAR WIDGET
==========================================*/

let currentDate = new Date();

function renderCalendar() {

   const calendarGrid = document.getElementById("calendarGrid");

if (!calendarGrid) return;


    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

   const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");

if (monthSelect) monthSelect.value = month;
if (yearSelect) yearSelect.value = year;


    for (let i = 0; i < firstDay; i++) {
        calendarGrid.innerHTML += `<div class="inactive"></div>`;
    }

    const today = new Date();

    for (let day = 1; day <= lastDate; day++) {

        const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

        calendarGrid.innerHTML += `
            <div class="${isToday ? "today" : ""}">
                ${day}
            </div>
        `;
    }
}

function initCalendar() {

    renderCalendar();


    const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");

/* Populate Years */

yearSelect.innerHTML = "";

for(let year=2020;year<=2035;year++){

    yearSelect.innerHTML += `
        <option value="${year}">
            ${year}
        </option>
    `;

}

monthSelect.value = currentDate.getMonth();
yearSelect.value = currentDate.getFullYear();

/* Month Changed */

monthSelect.addEventListener("change",()=>{

    currentDate.setMonth(Number(monthSelect.value));

    renderCalendar();

});

/* Year Changed */

yearSelect.addEventListener("change",()=>{

    currentDate.setFullYear(Number(yearSelect.value));

    renderCalendar();

});

/* Today Button */

document.getElementById("todayBtn")
.addEventListener("click",()=>{

    currentDate=new Date();

    monthSelect.value=currentDate.getMonth();

    yearSelect.value=currentDate.getFullYear();

    renderCalendar();

});

    document.getElementById("prevMonth")?.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);

monthSelect.value = currentDate.getMonth();
yearSelect.value = currentDate.getFullYear();

renderCalendar();

    });

    document.getElementById("nextMonth")?.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

}

/* Wait for components to load */

window.addEventListener("load", () => {

    setTimeout(initCalendar, 300);

});