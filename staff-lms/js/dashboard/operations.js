/* ==========================================================
   GOULDINGS STAFF LMS
   Operations Module
   operations.js
   Part 1 - Core + Calendar Engine
========================================================== */

(() => {

"use strict";

/*==========================================================
LOCAL STORAGE KEYS
==========================================================*/

const STORAGE = {
    STAFF: "ops_staff",
    EVENTS: "ops_events",
    NOTICES: "ops_notices",
    DOCUMENTS: "ops_documents",
    MESSAGES: "ops_messages"
};

/*==========================================================
DOM
==========================================================*/

const $ = (s)=>document.querySelector(s);
const $$=(s)=>document.querySelectorAll(s);

const dom={
    staffSelect:$("#staffSelect"),
    monthYear:$("#monthYear"),
    calendarGrid:$("#calendarGrid"),
    upcoming:$("#upcomingEvents")
};

/*==========================================================
TODAY
==========================================================*/

let currentDate=new Date();

let currentMonth=currentDate.getMonth();

let currentYear=currentDate.getFullYear();

let selectedStaff="all";

/*==========================================================
DEFAULT STAFF
==========================================================*/

const defaultStaff=[

{
id:"Derrick",
name:"Derrick Mason",
colour:"#3b82f6"
},




{
id:"joy",
name:"Joy Banerjee",
colour:"#3b82f6"
},

{
id:"dp",
name:"DP",
colour:"#10b981"
},

{
id:"nidhi",
name:"NIDHI",
colour:"#f59e0b"
},

{
id:"prathistha",
name:"PRATHISTHA",
colour:"#ec4899"
},

{
id:"arnab",
name:"ARNAB",
colour:"#8b5cf6"
}

];

/*==========================================================
HELPERS
==========================================================*/

function save(key,data){

localStorage.setItem(key,JSON.stringify(data));

}

function load(key,fallback){

try{

const raw=localStorage.getItem(key);

if(!raw) return fallback;

return JSON.parse(raw);

}catch{

return fallback;

}

}

/*==========================================================
LOAD DATA
==========================================================*/

let staff=load(STORAGE.STAFF,defaultStaff);

save(STORAGE.STAFF,staff);

let events=load(STORAGE.EVENTS,[]);

/*==========================================================
POPULATE STAFF DROPDOWN
==========================================================*/

function loadStaffDropdown(){

if(!dom.staffSelect) return;

dom.staffSelect.innerHTML="";

const all=document.createElement("option");

all.value="all";

all.textContent="All Calendars";

dom.staffSelect.appendChild(all);

staff.forEach(member=>{

const option=document.createElement("option");

option.value=member.id;

option.textContent=member.name;

dom.staffSelect.appendChild(option);

});

dom.staffSelect.value=selectedStaff;

dom.staffSelect.onchange=()=>{

selectedStaff=dom.staffSelect.value;

renderCalendar();

renderUpcoming();

};

}

/*==========================================================
DATE FORMAT
==========================================================*/



function pad(n){

return String(n).padStart(2,"0");

}

function formatDate(y,m,d){

return `${y}-${pad(m+1)}-${pad(d)}`;

}

/*==========================================================
MONTH TITLE
==========================================================*/

function updateHeading(){

if(!dom.monthYear) return;

const months=[

"January","February","March","April","May","June",

"July","August","September","October","November","December"

];

dom.monthYear.textContent=`${months[currentMonth]} ${currentYear}`;

}

/*==========================================================
EVENT FILTER
==========================================================*/

function filteredEvents(){

if(selectedStaff==="all") return events;

return events.filter(e=>e.staff===selectedStaff);

}

/*==========================================================
RENDER CALENDAR
==========================================================*/

function renderCalendar(){

if(!dom.calendarGrid) return;

updateHeading();

dom.calendarGrid.innerHTML="";

let first=new Date(currentYear,currentMonth,1);

let startDay=first.getDay();

if(startDay===0) startDay=7;

const totalDays=new Date(currentYear,currentMonth+1,0).getDate();

for(let i=1;i<startDay;i++){

const blank=document.createElement("div");

blank.className="calendar-day empty";

dom.calendarGrid.appendChild(blank);

}

const filtered=filteredEvents();

for(let day=1;day<=totalDays;day++){

const fullDate=formatDate(currentYear,currentMonth,day);

const box=document.createElement("div");

box.className="calendar-day";

const today=
day===currentDate.getDate() &&
currentMonth===currentDate.getMonth() &&
currentYear===currentDate.getFullYear();

if(today){

box.classList.add("today");

}

const num=document.createElement("div");

num.className="day-number";

num.textContent=day;

box.appendChild(num);

const dotWrap=document.createElement("div");

dotWrap.className="day-dots";

filtered
.filter(e=>e.date===fullDate)
.slice(0,3)
.forEach(ev=>{

const dot=document.createElement("span");

dot.className="event-dot";

const owner=staff.find(s=>s.id===ev.staff);

dot.style.background=owner?owner.colour:"#1e88e5";

dot.title=ev.title;

dotWrap.appendChild(dot);

});

box.appendChild(dotWrap);

box.onclick=()=>{

if(typeof openEventModal==="function"){

openEventModal(fullDate);

}

};

dom.calendarGrid.appendChild(box);

}

}

/*==========================================================
UPCOMING EVENTS
==========================================================*/

function renderUpcoming(){

if(!dom.upcoming) return;

dom.upcoming.innerHTML="";

const upcoming=filteredEvents()

.sort((a,b)=>{

return (a.date+a.time).localeCompare(b.date+b.time);

})

.slice(0,8);

if(upcoming.length===0){

dom.upcoming.innerHTML=`
<div class="empty-state">
No upcoming events
</div>
`;

return;

}

upcoming.forEach(event=>{

const owner=staff.find(s=>s.id===event.staff);

const card=document.createElement("div");

card.className="event-card";

card.innerHTML=`

<div class="event-left">

<h4>${event.title}</h4>

<p>${event.date} ${event.time}</p>

<small>${owner?owner.name:""}</small>

</div>

`;

card.onclick=()=>{

if(typeof openEventModal==="function"){

openEventModal(event.date,event.id);

}

};

dom.upcoming.appendChild(card);

});

}

/*==========================================================
MONTH BUTTONS
==========================================================*/

$("#prevMonth")?.addEventListener("click",()=>{

currentMonth--;

if(currentMonth<0){

currentMonth=11;

currentYear--;

}

renderCalendar();

renderUpcoming();

});

$("#nextMonth")?.addEventListener("click",()=>{

currentMonth++;

if(currentMonth>11){

currentMonth=0;

currentYear++;

}

renderCalendar();

renderUpcoming();

});

$("#todayBtn")?.addEventListener("click",()=>{

currentDate=new Date();

currentMonth=currentDate.getMonth();

currentYear=currentDate.getFullYear();

renderCalendar();

renderUpcoming();

});

/*==========================================================
INITIALISE
==========================================================*/

loadStaffDropdown();

renderCalendar();

renderUpcoming();

/*==========================================================
PART 2 CONTINUES HERE
==========================================================*/
/*==========================================================
EVENT MODAL REFERENCES
==========================================================*/

const eventModal = document.getElementById("eventModal");

const eventTitle = document.getElementById("eventTitle");
const eventTime = document.getElementById("eventTime");
const eventStaff = document.getElementById("eventStaff");
const eventLocation = document.getElementById("eventLocation");
const eventDescription = document.getElementById("eventDescription");

const saveEventBtn = document.getElementById("saveEvent");
const deleteEventBtn = document.getElementById("deleteEvent");
const cancelEventBtn = document.getElementById("cancelEvent");

let selectedDate = "";
let editingEventId = null;

/*==========================================================
ID GENERATOR
==========================================================*/

function generateID(){

    return "EVT_" + Date.now() + "_" + Math.random().toString(36).substring(2,8);

}

/*==========================================================
OPEN MODAL
==========================================================*/

function openEventModal(date,eventID=null){

    if(!eventModal) return;

    selectedDate=date;

    editingEventId=eventID;

    eventTitle.value="";
    eventTime.value="";
    if(eventStaff) eventStaff.value="derrick";
    eventLocation.value="";
    eventDescription.value="";

    deleteEventBtn.style.display="none";

    if(eventID){

        const ev=events.find(e=>e.id===eventID);

        if(ev){

            eventTitle.value=ev.title;
            eventTime.value=ev.time;
            if(eventStaff) eventStaff.value=ev.staff || "derrick";
            eventLocation.value=ev.location;
            eventDescription.value=ev.description;

            deleteEventBtn.style.display="inline-flex";

        }

    }

    eventModal.classList.add("show");

}

/*==========================================================
CLOSE MODAL
==========================================================*/

function closeEventModal(){

    if(!eventModal) return;

    eventModal.classList.remove("show");

    editingEventId=null;

}

/*==========================================================
SAVE EVENT
==========================================================*/

function saveEvent(){

    if(eventTitle.value.trim()===""){

        alert("Please enter an event title.");

        return;

    }

    if(editingEventId){

        const ev=events.find(e=>e.id===editingEventId);

        if(ev){

            ev.title=eventTitle.value.trim();
            ev.time=eventTime.value;
            ev.staff=eventStaff?.value || ev.staff;
            ev.location=eventLocation.value.trim();
            ev.description=eventDescription.value.trim();

        }

    }else{

        events.push({

            id:generateID(),

            staff:eventStaff?.value || "derrick",

            title:eventTitle.value.trim(),

            date:selectedDate,

            time:eventTime.value,

            location:eventLocation.value.trim(),

            description:eventDescription.value.trim()

        });

    }

    save(STORAGE.EVENTS,events);

    renderCalendar();

    renderUpcoming();

    window.dispatchEvent(new Event("opsEventsChanged"));

    closeEventModal();

}

/*==========================================================
DELETE EVENT
==========================================================*/

function deleteEvent(){

    if(!editingEventId) return;

    if(!confirm("Delete this event?")) return;

    events=events.filter(e=>e.id!==editingEventId);

    save(STORAGE.EVENTS,events);

    renderCalendar();

    renderUpcoming();

    window.dispatchEvent(new Event("opsEventsChanged"));

    closeEventModal();

}

/*==========================================================
MODAL BUTTONS
==========================================================*/

saveEventBtn?.addEventListener("click",saveEvent);

deleteEventBtn?.addEventListener("click",deleteEvent);

cancelEventBtn?.addEventListener("click",closeEventModal);

/*==========================================================
CLICK OUTSIDE MODAL
==========================================================*/

eventModal?.addEventListener("click",(e)=>{

    if(e.target===eventModal){

        closeEventModal();

    }

});

/*==========================================================
ESC KEY
==========================================================*/

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeEventModal();

    }

});

/*==========================================================
END OF PART 2
PART 3 CONTINUES BELOW
==========================================================*/

/*==========================================================
NOTICE BOARD
==========================================================*/

let notices = load(STORAGE.NOTICES,[
{
id:"N1",
title:"Admissions Campaign Starts Monday",
priority:"high",
description:"All counsellors must begin contacting prospective students.",
author:"Administration",
date:new Date().toLocaleDateString()
},
{
id:"N2",
title:"Weekly Sales Meeting",
priority:"medium",
description:"Friday 4 PM with CEO.",
author:"Sales",
date:new Date().toLocaleDateString()
},
{
id:"N3",
title:"Admissions Campaign Starts Monday",
priority:"high",
description:"All counsellors must begin contacting prospective students.",
author:"Administration",
date:new Date().toLocaleDateString()
},

{
id:"N4",
title:"Admissions Campaign Starts Monday",
priority:"high",
description:"All counsellors must begin contacting prospective students.",
author:"Administration",
date:new Date().toLocaleDateString()
},

{
id:"N5",
title:"Admissions Campaign Starts Monday",
priority:"high",
description:"All counsellors must begin contacting prospective students.",
author:"Administration",
date:new Date().toLocaleDateString()
},

{
id:"N6",
title:"Admissions Campaign Starts Monday",
priority:"high",
description:"All counsellors must begin contacting prospective students.",
author:"Administration",
date:new Date().toLocaleDateString()
},






]);

save(STORAGE.NOTICES,notices);

const noticeBoard=document.getElementById("noticeBoard");

function renderNotices(){

if(!noticeBoard) return;

noticeBoard.innerHTML="";

if(notices.length===0){

noticeBoard.innerHTML="<div class='empty-state'>No notices available.</div>";

return;

}

notices.forEach(n=>{

const card=document.createElement("div");

card.className=`notice-card ${n.priority}`;

card.innerHTML = `

<div class="notice-badge">${n.priority.toUpperCase()}</div>

<h4>${n.title}</h4>

<p>${n.description}</p>

<small>${n.author} • ${n.date}</small>

<div class="notice-actions">
    <button type="button" data-delete-notice="${n.id}">
        Delete
    </button>
</div>

`;

noticeBoard.appendChild(card);

});

}

renderNotices();

noticeBoard?.addEventListener("click", (event) => {

    console.log("Clicked:", event.target);

    const button = event.target.closest("[data-delete-notice]");

    console.log("Button:", button);

    if (!button) return;

    console.log("Notice ID:", button.dataset.deleteNotice);

    if (!confirm("Delete this notice?")) return;

    const id = button.dataset.deleteNotice;

    notices = notices.filter(n => String(n.id) !== String(id));

    console.log("Remaining notices:", notices);

    save(STORAGE.NOTICES, notices);

    renderNotices();

});
/*==========================================================
TEAM MESSAGES
==========================================================*/

let messages=load(STORAGE.MESSAGES,[
{
id:"M1",
staff:"Joy Banerjee",
text:"Please update all student enquiries before 5 PM."
},
{
id:"M2",
staff:"DP",
text:"Marketing campaign begins tomorrow."
}
]);

messages=messages.map((message,index)=>({ ...message, id:message.id || `M_${Date.now()}_${index}` }));

save(STORAGE.MESSAGES,messages);

const messageList=document.querySelector(".message-list");
const composeBox=document.querySelector(".message-compose input");
const sendButton=document.querySelector(".message-compose button");

function initials(name){

return name.split(" ").map(x=>x[0]).join("").substring(0,2).toUpperCase();

}

function renderMessages(){

if(!messageList) return;

messageList.innerHTML="";

messages.forEach(msg=>{

const div=document.createElement("div");

div.className="message-item";

div.innerHTML=`

<div class="avatar">${initials(msg.staff)}</div>

<div class="message-content">

<strong>${msg.staff}</strong>

<p>${msg.text}</p>

<div class="message-actions">
<button type="button" class="message-action" data-edit-message="${msg.id}">Edit</button>
<button type="button" class="message-action delete-message" data-delete-message="${msg.id}">Delete</button>
</div>

</div>

`;

messageList.appendChild(div);

});

}

renderMessages();

sendButton?.addEventListener("click",()=>{

const text=composeBox.value.trim();

if(text==="") return;

messages.unshift({

id:"M_"+Date.now(),

staff:"You",

text:text

});

save(STORAGE.MESSAGES,messages);

composeBox.value="";

renderMessages();

});


/*==========================================================
MESSAGE EDITING
==========================================================*/

const messageModal=document.getElementById("messageModal");
const editMessageText=document.getElementById("editMessageText");
let editingMessageId=null;

function closeMessageEditor(){
  messageModal?.classList.remove("show");
  editingMessageId=null;
  if(editMessageText) editMessageText.value="";
}

messageList?.addEventListener("click", event=>{
  const editButton=event.target.closest("[data-edit-message]");
  const deleteButton=event.target.closest("[data-delete-message]");
  if(editButton){
    const message=messages.find(item=>item.id===editButton.dataset.editMessage);
    if(!message) return;
    editingMessageId=message.id;
    editMessageText.value=message.text;
    messageModal?.classList.add("show");
  }
  if(deleteButton){
    const id=deleteButton.dataset.deleteMessage;
    if(!confirm("Delete this message?")) return;
    messages=messages.filter(item=>item.id!==id);
    save(STORAGE.MESSAGES,messages);
    renderMessages();
  }
});

document.getElementById("saveMessageEdit")?.addEventListener("click",()=>{
  const text=editMessageText.value.trim();
  const message=messages.find(item=>item.id===editingMessageId);
  if(!text || !message) return;
  message.text=text;
  save(STORAGE.MESSAGES,messages);
  renderMessages();
  closeMessageEditor();
});

["closeMessageModal","cancelMessageEdit"].forEach(id=>document.getElementById(id)?.addEventListener("click",closeMessageEditor));
messageModal?.addEventListener("click",event=>{ if(event.target===messageModal) closeMessageEditor(); });
/*==========================================================
DOCUMENT LIBRARY
==========================================================*/

let documents=load(STORAGE.DOCUMENTS,[

{name:"Admissions Policy.pdf"},

{name:"Sales Handbook.pdf"},

{name:"Student Recruitment.pdf"}

]);

documents=documents.map((document,index)=>({ ...document, id:document.id || `DOC_${Date.now()}_${index}` }));

save(STORAGE.DOCUMENTS,documents);

const documentList=document.querySelector(".document-list");

function renderDocuments(){

if(!documentList) return;

documentList.innerHTML="";

documents.forEach(doc=>{

const row=document.createElement("div");

row.className="document-item";

row.innerHTML=`

<i class="fa-solid fa-file-pdf"></i>

<span>${doc.name}</span><div class="document-actions"><button type="button" data-edit-document="${doc.id}">Edit</button><button type="button" data-delete-document="${doc.id}">Delete</button></div>

`;

documentList.appendChild(row);

});

}

renderDocuments();


documentList?.addEventListener("click",event=>{
  const edit=event.target.closest("[data-edit-document]");
  const remove=event.target.closest("[data-delete-document]");
  if(edit){ const doc=documents.find(item=>item.id===edit.dataset.editDocument); const name=doc && prompt("Document name",doc.name); if(name?.trim()){ doc.name=name.trim(); save(STORAGE.DOCUMENTS,documents); renderDocuments(); } }
  if(remove){ const id=remove.dataset.deleteDocument; if(confirm("Delete this document?")){ documents=documents.filter(item=>item.id!==id); save(STORAGE.DOCUMENTS,documents); renderDocuments(); } }
});

const metricState=load("ops_metrics",{});
function applyMetricState(){ document.querySelectorAll(".stat-box[data-metric]").forEach(card=>{ const id=card.dataset.metric; const state=metricState[id]; if(state?.deleted){card.hidden=true; return;} if(state?.value) card.querySelector("span").textContent=state.value; }); }
document.querySelector(".stats-grid")?.addEventListener("click",event=>{ const card=event.target.closest(".stat-box"); if(!card) return; const id=card.dataset.metric; if(event.target.closest("[data-edit-metric]")){ const value=prompt("Metric value",card.querySelector("span").textContent); if(value?.trim()){metricState[id]={value:value.trim()}; save("ops_metrics",metricState); applyMetricState();} } if(event.target.closest("[data-delete-metric]") && confirm("Remove this metric?")){metricState[id]={deleted:true}; save("ops_metrics",metricState); applyMetricState();} });
applyMetricState();
/*==========================================================
PDF UPLOAD
==========================================================*/

const uploadInput=document.getElementById("pdfFile");

const uploadButton=document.getElementById("uploadDocumentBtn");

uploadButton?.addEventListener("click",()=>{

if(!uploadInput.files.length){

alert("Please choose a PDF.");

return;

}

const file=uploadInput.files[0];

documents.unshift({

id:"DOC_"+Date.now(),

name:file.name

});

documents=documents.map((document,index)=>({ ...document, id:document.id || `DOC_${Date.now()}_${index}` }));

save(STORAGE.DOCUMENTS,documents);

renderDocuments();

alert("Document uploaded successfully.");

const modal=document.getElementById("uploadModal");

modal?.classList.remove("show");

uploadInput.value="";

});

/*==========================================================
UPLOAD MODAL
==========================================================*/

document.getElementById("uploadPdfBtn")?.addEventListener("click",()=>{

document.getElementById("uploadModal")?.classList.add("show");

});

document.getElementById("cancelUploadBtn")?.addEventListener("click",()=>{

document.getElementById("uploadModal")?.classList.remove("show");

});

document.getElementById("closeUploadModal")?.addEventListener("click",()=>{

document.getElementById("uploadModal")?.classList.remove("show");

});

/*==========================================================
CREATE NOTICE MODAL
==========================================================*/

document.getElementById("newNoticeBtn")?.addEventListener("click",()=>{

document.getElementById("noticeModal")?.classList.add("show");

});

document.getElementById("cancelNoticeBtn")?.addEventListener("click",()=>{

document.getElementById("noticeModal")?.classList.remove("show");

});

document.getElementById("closeNoticeModal")?.addEventListener("click",()=>{

document.getElementById("noticeModal")?.classList.remove("show");

});

document.getElementById("saveNoticeBtn")?.addEventListener("click",()=>{

const title=document.getElementById("noticeTitle").value.trim();

const priority=document.getElementById("noticePriority").value;

const description=document.getElementById("noticeDescription").value.trim();

if(title===""){

alert("Enter notice title.");

return;

}

fetch("http://localhost:5000/api/notifications", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        title,
        message: description,
        type: "general"
    })
})
.then(res => {
    if (!res.ok) {
        throw new Error("Failed to save notification.");
    }
    return res.json();
})
.then(() => {

    notices.unshift({
        id: "N_" + Date.now(),
        title,
        priority,
        description,
        author: "You",
        date: new Date().toLocaleDateString()
    });

    save(STORAGE.NOTICES, notices);

    renderNotices();

    if (typeof loadNotifications === "function") {
        loadNotifications();
    }

    document.getElementById("noticeModal").classList.remove("show");

    document.getElementById("noticeTitle").value = "";
    document.getElementById("noticeDescription").value = "";

})
.catch(error => {
    console.error(error);
    alert("Unable to save the notice. Please try again.");
});

});

/*==========================================================
END OF PART 3
PART 4 WILL COMPLETE THE ENTIRE FILE
==========================================================*/

/*==========================================================
STATISTICS
==========================================================*/

function updateStatistics(){

    const totalApplications=document.querySelector(".stat-box:nth-child(1) span");
    const totalAdmissions=document.querySelector(".stat-box:nth-child(2) span");
    const totalRevenue=document.querySelector(".stat-box:nth-child(3) span");
    const responseRate=document.querySelector(".stat-box:nth-child(4) span");

    if(totalApplications){
        totalApplications.textContent=120+events.length;
    }

    if(totalAdmissions){
        totalAdmissions.textContent=Math.floor(events.length*0.6)+48;
    }

    if(totalRevenue){
        totalRevenue.textContent="\u00A3"+((events.length*350)+42000).toLocaleString();
    }

    if(responseRate){
        responseRate.textContent="96%";
    }

}

updateStatistics();

/*==========================================================
AUTO REFRESH
==========================================================*/

function refreshDashboard(){

    renderCalendar();

    renderUpcoming();

    renderNotices();

    renderMessages();

    renderDocuments();

    updateStatistics();

}

/*==========================================================
SEARCH EVENTS
==========================================================*/

function searchEvents(keyword){

    keyword=keyword.toLowerCase();

    return events.filter(e=>{

        return (

            e.title.toLowerCase().includes(keyword) ||

            (e.location||"").toLowerCase().includes(keyword) ||

            (e.description||"").toLowerCase().includes(keyword)

        );

    });

}

/*==========================================================
EXPORT EVENTS
==========================================================*/

function exportEvents(){

    const data=JSON.stringify(events,null,2);

    const blob=new Blob([data],{

        type:"application/json"

    });

    const url=URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;

    a.download="operations-events.json";

    a.click();

    URL.revokeObjectURL(url);

}

/*==========================================================
IMPORT EVENTS
==========================================================*/

function importEvents(file){

    const reader=new FileReader();

    reader.onload=function(){

        try{

            const imported=JSON.parse(reader.result);

            if(Array.isArray(imported)){

                events=imported;

                save(STORAGE.EVENTS,events);

                refreshDashboard();

            }

        }catch{

            alert("Invalid JSON file.");

        }

    };

    reader.readAsText(file);

}

/*==========================================================
WINDOW HELPERS
==========================================================*/

window.refreshOperations=refreshDashboard;

window.exportOperations=exportEvents;


/* Keep the calendar widget and Operations meeting data in sync. */
document.addEventListener("calendarWidget:dateSelected", event=>{
  openEventModal(event.detail.date, event.detail.eventId || null);
});

composeBox?.addEventListener("keydown", event=>{
  if(event.key === "Enter" && !event.shiftKey){
    event.preventDefault();
    sendButton?.click();
  }
});
/*==========================================================
OPERATIONS ACTIONS AND VIEW-ALL DIALOG
==========================================================*/

document.querySelectorAll("[data-open-upload]").forEach(button=>button.addEventListener("click",()=>{
  document.getElementById("uploadModal")?.classList.add("show");
}));

document.querySelectorAll("[data-open-notice]").forEach(button=>button.addEventListener("click",()=>{
  document.getElementById("noticeModal")?.classList.add("show");
}));


document.querySelectorAll("[data-open-briefing]").forEach(button=>button.addEventListener("click",()=>{
  document.getElementById("noticeModalTitle").textContent="Write briefing";
  document.getElementById("noticeTitle").value="Team Briefing";
  document.getElementById("noticeDescription").focus();
  document.getElementById("noticeModal")?.classList.add("show");
}));
const listModal=document.getElementById("listModal");
const listModalTitle=document.getElementById("listModalTitle");
const listModalContent=document.getElementById("listModalContent");

function showAllForCard(button){
  const title=button.closest(".glass-card")?.querySelector("h3")?.textContent.trim() || "All items";
  const content = title.includes("Upcoming")
    ? (events.length ? events.map(e=>`<article><strong>${e.title}</strong><span>${e.date}${e.time ? ` at ${e.time}` : ""}</span></article>`).join("") : "<p>No events scheduled yet.</p>")
    : title.includes("Notice")
      ? (notices.length ? notices.map(n=>`<article><strong>${n.title}</strong><span>${n.description}</span></article>`).join("") : "<p>No notices available.</p>")
      : title.includes("News")
        ? (Array.from(document.querySelectorAll("#newsList > *")).map(item=>`<article>${item.innerHTML}</article>`).join("") || "<p>No news available.</p>")
        : "<p>There are no additional items to show.</p>";
  listModalTitle.textContent=title;
  listModalContent.innerHTML=content;
  listModal?.classList.add("show");
}

document.querySelectorAll(".link-btn, [data-view-all]").forEach(button=>{
  if(button.textContent.trim()==="View All") button.addEventListener("click",()=>showAllForCard(button));
});

document.getElementById("closeListModal")?.addEventListener("click",()=>listModal?.classList.remove("show"));
listModal?.addEventListener("click",event=>{ if(event.target===listModal) listModal.classList.remove("show"); });
/*==========================================================
INITIAL STARTUP
==========================================================*/

document.addEventListener("DOMContentLoaded",()=>{

   
    renderNotices();

    renderMessages();

    renderDocuments();

    updateStatistics();

});

/*==========================================================
FINAL CLOSE
==========================================================*/

})();

