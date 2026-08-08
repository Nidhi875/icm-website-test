/*=========================================================
GOULDINGS STAFF LMS
PREMIUM CALENDAR - JS (patched)
=========================================================*/

let currentDate = new Date();
let editingIndex = -1;

let events = [
    { id:1, title:"Weekly Staff Meeting", date:"2026-08-10", time:"09:00", type:"meeting", location:"Conference Room", description:"Weekly planning meeting."},
    { id:2, title:"Orientation Programme", date:"2026-08-12", time:"10:30", type:"class", location:"Main Hall", description:"New student induction."},
    { id:3, title:"Faculty Briefing", date:"2026-08-18", time:"11:00", type:"meeting", location:"Board Room", description:"Monthly faculty meeting."},
    { id:4, title:"Semester Assessment", date:"2026-08-22", time:"09:00", type:"assignment", location:"Exam Hall", description:"Internal assessment."}
];

document.addEventListener("DOMContentLoaded",()=>{
    bindButtons();
    renderCalendar();
    renderUpcoming();
    renderToday();
    renderTimeline();
    updateStats();
});

/* RENDER CALENDAR */
function renderCalendar(){
    const grid=document.getElementById("calendarGrid");
    const heading=document.getElementById("monthYear");
    if (!grid || !heading) return;
    grid.innerHTML="";
    heading.textContent = currentDate.toLocaleString("en-US",{ month:"long", year:"numeric" });
    const year=currentDate.getFullYear();
    const month=currentDate.getMonth();
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // convert Sun=0 to index where Mon=0
    const daysInMonth=new Date(year,month+1,0).getDate();
    const prevMonthDays=new Date(year,month,0).getDate();

    // previous month filler
    for(let i=firstDay;i>0;i--){
        grid.innerHTML+=`
            <div class="day inactive">
                <div class="date">${prevMonthDays-i+1}</div>
            </div>
        `;
    }

    // current month
    for(let day=1;day<=daysInMonth;day++){
        const fullDate=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        const today = day===new Date().getDate() && month===new Date().getMonth() && year===new Date().getFullYear();
        const dayEvents = events.filter(event => event.date === fullDate);
        let dots = "";
        if(dayEvents.length>0){
            // show up to 3 dots
            const count = Math.min(dayEvents.length,3);
            for(let i=0;i<count;i++){
                dots += `<span class="event-dot"></span>`;
            }
        }
        grid.innerHTML+=`
            <div class="day ${today ? "today" : ""}" data-date="${fullDate}">
                <div class="date">${day}</div>
                <div class="day-dots">${dots}</div>
            </div>
        `;
    }

    // fill remaining cells to 42
    const cells = grid.children.length;
    const remain = Math.max(0, 42 - cells);
    for(let i=1;i<=remain;i++){
        grid.innerHTML+=`
            <div class="day inactive">
                <div class="date">${i}</div>
            </div>
        `;
    }
}

/* UPCOMING EVENTS */
function renderUpcoming() {
    const container = document.getElementById("upcomingEvents");
    if (!container) return;
    container.innerHTML = "";
    // sort by date ascending
    const sorted = events.slice().sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    sorted.forEach(event => {
        container.innerHTML += `
            <div class="event-card">
                <div class="event-icon"><i class="fa-regular fa-calendar"></i></div>
                <div class="event-info">
                    <h4>${event.title}</h4>
                    <p>${event.date} • ${event.time}</p>
                </div>
                <div class="event-date">${event.location || ""}</div>
            </div>
        `;
    });
}

/* TODAY'S SCHEDULE */
function renderToday() {
    const container = document.getElementById("todaySchedule");
    if (!container) return;
    container.innerHTML = "";
    const today = new Date().toISOString().split("T")[0];
    const todayEvents = events.filter(e => e.date === today).sort((a,b)=>a.time.localeCompare(b.time));
    if(todayEvents.length===0){
        container.innerHTML="<p style='color:#9fb0c5;margin:0'>No events today.</p>";
        return;
    }
    todayEvents.forEach(event=>{
        container.innerHTML += `
            <div class="schedule-item">
                <div class="schedule-dot"></div>
                <div class="schedule-info">
                    <h4 style="margin:0; font-size:14px; font-weight:700">${event.title}</h4>
                    <p style="margin:2px 0 0;color:#9fb0c5">${event.time} • ${event.location || ""}</p>
                </div>
            </div>
        `;
    });
}

/* TIMELINE */
function renderTimeline(){
    const timeline=document.getElementById("dayTimeline");
    if(!timeline) return;
    timeline.innerHTML="";
    // show events for the currently selected visible month/day (simple list)
    const sorted = events.slice().sort((a,b)=>a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    sorted.forEach(event=>{
        timeline.innerHTML+=`
            <div class="time-slot">
                <div class="time">${event.time}</div>
                <div class="event-box">
                    <h4 style="margin:0">${event.title}</h4>
                    <p style="margin:6px 0 0">${event.date} • ${event.location || ""}</p>
                </div>
            </div>
        `;
    });
}

/* STATISTICS */
function updateStats(){
    const meetings = events.filter(e => e.type === "meeting").length;
    const classes = events.filter(e => e.type === "class").length;
    const assignments = events.filter(e => e.type === "assignment").length;
    const holidays = events.filter(e => e.type === "holiday").length;
    const meetingCount = document.getElementById("meetingCount");
    const classCount = document.getElementById("classCount");
    const assignmentCount = document.getElementById("assignmentCount");
    const holidayCount = document.getElementById("holidayCount");
    if(meetingCount) meetingCount.textContent = meetings;
    if(classCount) classCount.textContent = classes;
    if(assignmentCount) assignmentCount.textContent = assignments;
    if(holidayCount) holidayCount.textContent = holidays;
}

/* MONTH NAV */
function previousMonth(){
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(); renderUpcoming(); renderToday(); renderTimeline(); updateStats();
}
function nextMonth(){
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(); renderUpcoming(); renderToday(); renderTimeline(); updateStats();
}
function today(){
    currentDate = new Date();
    renderCalendar(); renderUpcoming(); renderToday(); renderTimeline(); updateStats();
}

/* BIND BUTTONS */
function bindButtons() {
    const prev = document.getElementById("prevMonth");
    const next = document.getElementById("nextMonth");
    const todayBtn = document.getElementById("todayBtn");
    const addBtn = document.getElementById("addEventBtn");
    const addHeaderBtn = document.getElementById("addEventHeaderBtn");
    if (prev) prev.addEventListener("click", previousMonth);
    if (next) next.addEventListener("click", nextMonth);
    if (todayBtn) todayBtn.addEventListener("click", today);
    if (addBtn) addBtn.addEventListener("click", openEventModal);
    if (addHeaderBtn) addHeaderBtn.addEventListener("click", openEventModal);

    const closeBtn = document.getElementById("closeModal");
    if (closeBtn) closeBtn.addEventListener("click", closeEventModal);

    const cancelBtn = document.getElementById("cancelEvent");
    if (cancelBtn) cancelBtn.addEventListener("click", closeEventModal);

    const saveBtn = document.getElementById("saveEvent");
    if (saveBtn) saveBtn.addEventListener("click", saveEvent);

    // optional: clicking a day could open modal prefilled with that date
    const grid = document.getElementById("calendarGrid");
    if(grid){
        grid.addEventListener("click", (ev)=>{
            const day = ev.target.closest(".day");
            if(day && day.dataset && day.dataset.date){
                openEventModal(day.dataset.date);
            }
        });
    }
}

/* EVENT MODAL */
function openEventModal(prefillDate = null) {
    editingIndex = -1;
    const modal = document.getElementById("eventModal");
    if (!modal) return;
    // clear fields
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDate").value = prefillDate || "";
    document.getElementById("eventTime").value = "";
    document.getElementById("eventType").value = "meeting";
    document.getElementById("eventLocation").value = "";
    document.getElementById("eventDescription").value = "";
    modal.classList.add("show");
}

function closeEventModal() {
    const modal = document.getElementById("eventModal");
    if (modal) modal.classList.remove("show");
}

function saveEvent(){
    const title = document.getElementById("eventTitle").value.trim();
    const date = document.getElementById("eventDate").value;
    const time = document.getElementById("eventTime").value || "09:00";
    const type = document.getElementById("eventType").value;
    const location = document.getElementById("eventLocation").value.trim();
    const description = document.getElementById("eventDescription").value.trim();

    if(!title){
        alert("Please enter a title for the event.");
        return;
    }
    if(!date){
        alert("Please choose a date for the event.");
        return;
    }

    const newEvent = {
        id: Date.now(),
        title, date, time, type, location, description
    };

    events.push(newEvent);
    closeEventModal();

    // re-render everything relevant
    renderCalendar();
    renderUpcoming();
    renderToday();
    renderTimeline();
    updateStats();
}

