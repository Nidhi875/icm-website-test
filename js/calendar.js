(function () {
  let currentDate = new Date();

  function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    const heading = document.getElementById("monthYear");
    if (!grid || !heading) return;

    grid.innerHTML = "";
    heading.textContent = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 7 : firstDay; // Monday start
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Previous month filler
    for (let i = 1; i < firstDay; i++) {
      grid.insertAdjacentHTML("beforeend", `<div class="day inactive"><div class="date"></div></div>`);
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const today = d === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear();
      grid.insertAdjacentHTML("beforeend", `
        <div class="day ${today ? "today" : ""}">
          <div class="date">${d}</div>
        </div>
      `);
    }
  }

  function goToPrevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  }

  function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  }

  function goToToday() {
    currentDate = new Date();
    renderCalendar();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("prevMonth").addEventListener("click", goToPrevMonth);
    document.getElementById("nextMonth").addEventListener("click", goToNextMonth);
    document.getElementById("todayBtn").addEventListener("click", goToToday);
    renderCalendar();
  });
})();
