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


fetch("https://icm-website-test-production.up.railway.app/api/notifications", {
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
   UNIVERSITY ADMISSIONS
   EXCEL IMPORT + LIVE OPERATIONS DASHBOARD
==========================================================*/

const OPERATIONS_ADMISSIONS_API =
    "http://localhost:5000/api/operations";


/*==========================================================
   CREATE ADMISSIONS DASHBOARD
==========================================================*/

function createAdmissionsDashboard(){

    /* Prevent duplicate creation */
    if(document.getElementById("operationsAdmissionsDashboard")){
        return;
    }

    const dashboard = document.createElement("section");

    dashboard.id = "operationsAdmissionsDashboard";

    dashboard.className = "glass-card";

    dashboard.style.cssText = `
        width:100%;
        margin:20px 0;
        padding:24px;
        box-sizing:border-box;
    `;


    dashboard.innerHTML = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:15px;
            flex-wrap:wrap;
            margin-bottom:20px;
        ">

            <div>

                <h3 style="
                    margin:0;
                    font-size:20px;
                ">
                    <i class="fa-solid fa-graduation-cap"></i>
                    University Admissions Progress
                </h3>

                <p style="
                    margin:6px 0 0;
                    opacity:.65;
                    font-size:13px;
                ">
                    Student progression from Gouldings to university.
                </p>

            </div>


            <div style="
                display:flex;
                gap:8px;
                flex-wrap:wrap;
            ">

                <button
                    type="button"
                    id="operationsAdmissionsRefresh"
                    class="link-btn"
                >
                    <i class="fa-solid fa-rotate"></i>
                    Refresh
                </button>


                <button
                    type="button"
                    id="operationsAdmissionsImport"
                    class="primary-btn"
                >
                    <i class="fa-solid fa-file-excel"></i>
                    Import Admissions Excel
                </button>

            </div>

        </div>


        <!-- SUMMARY -->

        <div style="
            display:grid;
            grid-template-columns:
                repeat(5,minmax(0,1fr));
            gap:12px;
            margin-bottom:18px;
        " id="operationsAdmissionsSummary">


            <div class="glass-card" style="padding:15px;">
                <small>Total Students</small>
                <strong
                    id="operationsAdmissionsStudents"
                    style="
                        display:block;
                        font-size:25px;
                        margin-top:6px;
                    "
                >0</strong>
            </div>


            <div class="glass-card" style="padding:15px;">
                <small>Applications</small>
                <strong
                    id="operationsAdmissionsApplications"
                    style="
                        display:block;
                        font-size:25px;
                        margin-top:6px;
                    "
                >0</strong>
            </div>


            <div class="glass-card" style="padding:15px;">
                <small>Offers</small>
                <strong
                    id="operationsAdmissionsOffers"
                    style="
                        display:block;
                        font-size:25px;
                        margin-top:6px;
                    "
                >0</strong>
            </div>


            <div class="glass-card" style="padding:15px;">
                <small>Admissions</small>
                <strong
                    id="operationsAdmissionsConfirmed"
                    style="
                        display:block;
                        font-size:25px;
                        margin-top:6px;
                    "
                >0</strong>
            </div>


            <div class="glass-card" style="padding:15px;">
                <small>Revenue</small>
                <strong
                    id="operationsAdmissionsRevenue"
                    style="
                        display:block;
                        font-size:25px;
                        margin-top:6px;
                    "
                >£0</strong>
            </div>

        </div>


        <!-- IMPORT STATUS -->

        <div
            id="operationsAdmissionsImportStatus"
            style="
                font-size:13px;
                margin-bottom:15px;
                opacity:.7;
            "
        >
            No admissions Excel file imported yet.
        </div>


        <!-- ATTENTION -->

        <div
            id="operationsAdmissionsAttention"
            style="
                display:flex;
                gap:8px;
                flex-wrap:wrap;
                margin-bottom:18px;
            "
        >

            <span>
                Documents pending:
                <strong id="operationsDocumentsPending">0</strong>
            </span>

            <span>
                Applications preparing:
                <strong id="operationsApplicationsPreparing">0</strong>
            </span>

            <span>
                Offers pending:
                <strong id="operationsOffersPending">0</strong>
            </span>

            <span>
                Admissions pending:
                <strong id="operationsAdmissionsPending">0</strong>
            </span>

        </div>


        <!-- STUDENT TABLE -->

        <div style="
            width:100%;
            overflow-x:auto;
        ">

            <table
                style="
                    width:100%;
                    min-width:850px;
                    border-collapse:collapse;
                    font-size:13px;
                "
            >

                <thead>

                    <tr>

                        <th style="text-align:left;padding:10px;">
                            Student
                        </th>

                        <th style="text-align:left;padding:10px;">
                            Sales Agent
                        </th>

                        <th style="text-align:left;padding:10px;">
                            Country
                        </th>

                        <th style="text-align:left;padding:10px;">
                            University
                        </th>

                        <th style="text-align:left;padding:10px;">
                            Application
                        </th>

                        <th style="text-align:left;padding:10px;">
                            Offer
                        </th>

                        <th style="text-align:left;padding:10px;">
                            Admission
                        </th>

                    </tr>

                </thead>


                <tbody id="operationsAdmissionsStudentsTable">

                    <tr>

                        <td
                            colspan="7"
                            style="
                                text-align:center;
                                padding:25px;
                                opacity:.6;
                            "
                        >
                            Loading admissions data...
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    `;


    /*
       Put the new section immediately after
       the calendar widget when available.
       Otherwise place it at the beginning of
       the main Operations content.
    */

    const calendar =
        document.querySelector(
            "#calendarWidget"
        );


    if(calendar){

        calendar.insertAdjacentElement(
            "afterend",
            dashboard
        );

    }else{

        const main =
            document.querySelector("main");

        if(main){

            main.prepend(dashboard);

        }else{

            document.body.prepend(dashboard);

        }

    }


    /*
       Make summary cards responsive.
    */

    const style =
        document.createElement("style");

    style.id =
        "operationsAdmissionsResponsiveStyle";

    style.textContent = `

        @media(max-width:900px){

            #operationsAdmissionsSummary{
                grid-template-columns:
                    repeat(2,minmax(0,1fr))
                !important;
            }

        }


        @media(max-width:550px){

            #operationsAdmissionsSummary{
                grid-template-columns:
                    1fr
                !important;
            }

        }


        #operationsAdmissionsAttention span{

            padding:7px 10px;

            border-radius:999px;

            background:
                rgba(255,255,255,.06);

            border:
                1px solid
                rgba(255,255,255,.08);

            font-size:12px;

        }


        #operationsAdmissionsStudentsTable
        td{

            padding:10px;

            border-top:
                1px solid
                rgba(255,255,255,.07);

        }


        #operationsAdmissionsStudentsTable
        th{

            padding:10px;

        }

    `;

    document.head.appendChild(style);

}


/*==========================================================
   ESCAPE HTML
==========================================================*/

function escapeAdmissionsValue(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/*==========================================================
   LOAD ADMISSIONS DASHBOARD
==========================================================*/

async function loadOperationsAdmissions(){

    try{

        const response =
            await fetch(
                `${OPERATIONS_ADMISSIONS_API}/dashboard`,
                {
                    method:"GET",
                    cache:"no-store"
                }
            );


        const data =
            await response.json();


        if(
            !response.ok ||
            !data.success
        ){

            throw new Error(
                data.message ||
                "Unable to load admissions data."
            );

        }


        const summary =
            data.summary || {};


        const attention =
            data.attention || {};


        const students =
            Array.isArray(data.students)
                ? data.students
                : [];


        /*
           SUMMARY
        */

        const setValue =
            (id,value)=>{

                const element =
                    document.getElementById(id);

                if(element){

                    element.textContent =
                        value;

                }

            };


        setValue(
            "operationsAdmissionsStudents",
            Number(
                summary.totalStudents || 0
            ).toLocaleString()
        );


        setValue(
            "operationsAdmissionsApplications",
            Number(
                summary.applications || 0
            ).toLocaleString()
        );


        setValue(
            "operationsAdmissionsOffers",
            Number(
                summary.offers || 0
            ).toLocaleString()
        );


        setValue(
            "operationsAdmissionsConfirmed",
            Number(
                summary.admissions || 0
            ).toLocaleString()
        );


        setValue(
            "operationsAdmissionsRevenue",
            "£" +
            Number(
                summary.revenue || 0
            ).toLocaleString()
        );


        /*
           ATTENTION
        */

        setValue(
            "operationsDocumentsPending",
            Number(
                attention.documentsPending || 0
            ).toLocaleString()
        );


        setValue(
            "operationsApplicationsPreparing",
            Number(
                attention.applicationsPreparing || 0
            ).toLocaleString()
        );


        setValue(
            "operationsOffersPending",
            Number(
                attention.offersPending || 0
            ).toLocaleString()
        );


        setValue(
            "operationsAdmissionsPending",
            Number(
                attention.admissionsPending || 0
            ).toLocaleString()
        );


        /*
           LAST IMPORT
        */

        const importStatus =
            document.getElementById(
                "operationsAdmissionsImportStatus"
            );


        if(
            importStatus &&
            data.lastImport
        ){

            const lastImport =
                data.lastImport;


            importStatus.textContent =
                `${lastImport.file_name || "Admissions Excel"}`
                +
                ` • `
                +
                `${Number(
                    lastImport.records_processed || 0
                ).toLocaleString()} records processed`
                +
                ` • Last imported `
                +
                `${new Date(
                    lastImport.imported_at
                ).toLocaleString("en-GB")}`;

        }


        /*
           STUDENT TABLE
        */

    /*==========================================================
   STUDENT LIST + FILTERS + EXPANDABLE DETAILS
==========================================================*/

const table =
    document.getElementById(
        "operationsAdmissionsStudentsTable"
    );

if(!table) return;


/*----------------------------------------------------------
   SAVE CURRENT STUDENTS
----------------------------------------------------------*/

window.operationsAdmissionsStudents = students;


/*----------------------------------------------------------
   CREATE FILTER BAR ONCE
----------------------------------------------------------*/

let filters =
    document.getElementById(
        "operationsAdmissionsFilters"
    );

if(!filters){

    filters = document.createElement("div");

    filters.id =
        "operationsAdmissionsFilters";

    filters.style.cssText = `
        display:grid;
        grid-template-columns:
            minmax(220px,2fr)
            repeat(3,minmax(150px,1fr));
        gap:10px;
        margin:0 0 18px 0;
        padding:15px;
        border-radius:14px;
        background:rgba(255,255,255,.55);
        border:1px solid rgba(15,23,42,.08);
    `;


    filters.innerHTML = `

        <!-- SEARCH -->

        <input
            type="text"
            id="operationsAdmissionsSearch"
            placeholder="Search student, ID, agent..."
            style="
                width:100%;
                box-sizing:border-box;
                padding:11px 13px;
                border-radius:10px;
                border:1px solid #d1d5db;
                background:white;
                font-size:13px;
                outline:none;
            "
        >


        <!-- SALES AGENT -->

        <select
            id="operationsAdmissionsAgentFilter"
            style="
                width:100%;
                padding:11px 13px;
                border-radius:10px;
                border:1px solid #d1d5db;
                background:white;
                font-size:13px;
                outline:none;
            "
        >
            <option value="">All Sales Agents</option>
        </select>


        <!-- COUNTRY -->

        <select
            id="operationsAdmissionsCountryFilter"
            style="
                width:100%;
                padding:11px 13px;
                border-radius:10px;
                border:1px solid #d1d5db;
                background:white;
                font-size:13px;
                outline:none;
            "
        >
            <option value="">All Countries</option>
        </select>


        <!-- ADMISSION -->

        <select
            id="operationsAdmissionsStatusFilter"
            style="
                width:100%;
                padding:11px 13px;
                border-radius:10px;
                border:1px solid #d1d5db;
                background:white;
                font-size:13px;
                outline:none;
            "
        >
            <option value="">All Admission Statuses</option>
        </select>

    `;


    /*
       Put filters immediately before
       the table wrapper.
    */

    const tableWrapper =
        table.closest("div");

    if(tableWrapper){

        tableWrapper.parentElement.insertBefore(
            filters,
            tableWrapper
        );

    }


    /*------------------------------------------------------
       FILTER EVENTS
    ------------------------------------------------------*/

    document
        .getElementById(
            "operationsAdmissionsSearch"
        )
        ?.addEventListener(
            "input",
            renderFilteredAdmissions
        );


    document
        .getElementById(
            "operationsAdmissionsAgentFilter"
        )
        ?.addEventListener(
            "change",
            renderFilteredAdmissions
        );


    document
        .getElementById(
            "operationsAdmissionsCountryFilter"
        )
        ?.addEventListener(
            "change",
            renderFilteredAdmissions
        );


    document
        .getElementById(
            "operationsAdmissionsStatusFilter"
        )
        ?.addEventListener(
            "change",
            renderFilteredAdmissions
        );

}


/*----------------------------------------------------------
   BUILD FILTER OPTIONS
----------------------------------------------------------*/

function uniqueValues(field){

    return [
        ...new Set(
            students
                .map(student =>
                    String(
                        student[field] ?? ""
                    ).trim()
                )
                .filter(Boolean)
        )
    ].sort(
        (a,b) =>
            a.localeCompare(
                b,
                undefined,
                {sensitivity:"base"}
            )
    );

}


/* SALES AGENTS */

const agentFilter =
    document.getElementById(
        "operationsAdmissionsAgentFilter"
    );

if(agentFilter){

    const currentAgent =
        agentFilter.value;

    agentFilter.innerHTML =
        `<option value="">All Sales Agents</option>` +
        uniqueValues("salesAgent")
            .map(agent => `
                <option value="${escapeAdmissionsValue(agent)}">
                    ${escapeAdmissionsValue(agent)}
                </option>
            `)
            .join("");

    agentFilter.value =
        currentAgent;

}


/* COUNTRIES */

const countryFilter =
    document.getElementById(
        "operationsAdmissionsCountryFilter"
    );

if(countryFilter){

    const currentCountry =
        countryFilter.value;

    countryFilter.innerHTML =
        `<option value="">All Countries</option>` +
        uniqueValues("country")
            .map(country => `
                <option value="${escapeAdmissionsValue(country)}">
                    ${escapeAdmissionsValue(country)}
                </option>
            `)
            .join("");

    countryFilter.value =
        currentCountry;

}


/* ADMISSION STATUS */

const statusFilter =
    document.getElementById(
        "operationsAdmissionsStatusFilter"
    );

if(statusFilter){

    const currentStatus =
        statusFilter.value;

    statusFilter.innerHTML =
        `<option value="">All Admission Statuses</option>` +
        uniqueValues("admissionStatus")
            .map(status => `
                <option value="${escapeAdmissionsValue(status)}">
                    ${escapeAdmissionsValue(status)}
                </option>
            `)
            .join("");

    statusFilter.value =
        currentStatus;

}


/*----------------------------------------------------------
   RENDER FILTERED STUDENTS
----------------------------------------------------------*/

function renderFilteredAdmissions(){

    const allStudents =
        window.operationsAdmissionsStudents || [];


    const search =
        (
            document.getElementById(
                "operationsAdmissionsSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const selectedAgent =
        document.getElementById(
            "operationsAdmissionsAgentFilter"
        )?.value || "";


    const selectedCountry =
        document.getElementById(
            "operationsAdmissionsCountryFilter"
        )?.value || "";


    const selectedStatus =
        document.getElementById(
            "operationsAdmissionsStatusFilter"
        )?.value || "";


    const filtered =
        allStudents.filter(student => {

            const searchableText = [

                student.studentName,
                student.studentId,
                student.salesAgent,
                student.country,
                student.university,
                student.course,
                student.gouldingsCourse,
                student.applicationStatus,
                student.offerStatus,
                student.admissionStatus

            ]
            .map(value =>
                String(value ?? "")
                    .toLowerCase()
            )
            .join(" ");


            const matchesSearch =
                !search ||
                searchableText.includes(search);


            const matchesAgent =
                !selectedAgent ||
                String(
                    student.salesAgent ?? ""
                ) === selectedAgent;


            const matchesCountry =
                !selectedCountry ||
                String(
                    student.country ?? ""
                ) === selectedCountry;


            const matchesStatus =
                !selectedStatus ||
                String(
                    student.admissionStatus ?? ""
                ) === selectedStatus;


            return (
                matchesSearch &&
                matchesAgent &&
                matchesCountry &&
                matchesStatus
            );

        });


    /*------------------------------------------------------
       NO RESULTS
    ------------------------------------------------------*/

    if(filtered.length === 0){

        table.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                        opacity:.65;
                    "
                >
                    No students match the selected filters.
                </td>
            </tr>
        `;

        return;

    }


    /*------------------------------------------------------
       STUDENT ROWS
    ------------------------------------------------------*/

    table.innerHTML =
        filtered.map(
            (student,index) => {

                const rowId =
                    `admissionStudent_${index}_${String(
                        student.studentId ||
                        student.studentName ||
                        Date.now()
                    )
                    .replace(
                        /[^a-zA-Z0-9_-]/g,
                        "_"
                    )}`;


                const course =
                    student.gouldingsCourse ||
                    student.course ||
                    student.gouldings_course ||
                    "—";


                const revenue =
                    student.revenue ??
                    student.Revenue ??
                    0;


                const applicationStatus =
                    student.applicationStatus ||
                    "—";


                const offerStatus =
                    student.offerStatus ||
                    "—";


                const admissionStatus =
                    student.admissionStatus ||
                    "—";


                return `

                    <!-- MAIN STUDENT ROW -->

                    <tr
                        class="operations-admission-row"
                        data-student-row="${rowId}"
                        style="
                            cursor:pointer;
                            transition:background .2s ease;
                        "
                    >

                        <td>

                            <button
                                type="button"
                                class="operations-admission-expand"
                                data-target="${rowId}"
                                style="
                                    border:0;
                                    background:transparent;
                                    cursor:pointer;
                                    font-size:14px;
                                    margin-right:7px;
                                    color:#0f2b52;
                                "
                                title="View student details"
                            >
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>

                            <strong>
                                ${escapeAdmissionsValue(
                                    student.studentName ||
                                    "—"
                                )}
                            </strong>

                            <br>

                            <small style="opacity:.55;">
                                ${escapeAdmissionsValue(
                                    student.studentId ||
                                    ""
                                )}
                            </small>

                        </td>


                        <td>
                            ${escapeAdmissionsValue(
                                student.salesAgent ||
                                "Unassigned"
                            )}
                        </td>


                        <td>
                            ${escapeAdmissionsValue(
                                student.country ||
                                "—"
                            )}
                        </td>


                        <td>
                            ${escapeAdmissionsValue(
                                student.university ||
                                "—"
                            )}
                        </td>


                        <td>

                            <span
                                style="
                                    display:inline-block;
                                    padding:5px 9px;
                                    border-radius:999px;
                                    background:#eef2ff;
                                    font-size:12px;
                                "
                            >
                                ${escapeAdmissionsValue(
                                    applicationStatus
                                )}
                            </span>

                        </td>


                        <td>

                            <span
                                style="
                                    display:inline-block;
                                    padding:5px 9px;
                                    border-radius:999px;
                                    background:#fef3c7;
                                    font-size:12px;
                                "
                            >
                                ${escapeAdmissionsValue(
                                    offerStatus
                                )}
                            </span>

                        </td>


                        <td>

                            <span
                                style="
                                    display:inline-block;
                                    padding:5px 9px;
                                    border-radius:999px;
                                    background:#dcfce7;
                                    font-size:12px;
                                "
                            >
                                ${escapeAdmissionsValue(
                                    admissionStatus
                                )}
                            </span>

                        </td>

                    </tr>


                    <!-- EXPANDED DETAILS -->

                    <tr
                        id="${rowId}"
                        class="operations-admission-details"
                        style="
                            display:none;
                        "
                    >

                        <td
                            colspan="7"
                            style="
                                padding:0;
                                border-top:0;
                            "
                        >

                            <div
                                style="
                                    margin:0 10px 12px 10px;
                                    padding:18px;
                                    border-radius:12px;
                                    background:#f8fafc;
                                    border:1px solid #e5e7eb;
                                    display:grid;
                                    grid-template-columns:
                                        repeat(4,minmax(0,1fr));
                                    gap:15px;
                                "
                            >

                                <!-- COURSE -->

                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#6b7280;
                                            margin-bottom:4px;
                                        "
                                    >
                                        Gouldings Course
                                    </small>

                                    <strong>
                                        ${escapeAdmissionsValue(
                                            course
                                        )}
                                    </strong>

                                </div>


                                <!-- REVENUE -->

                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#6b7280;
                                            margin-bottom:4px;
                                        "
                                    >
                                        Revenue
                                    </small>

                                    <strong>
                                        £${Number(
                                            revenue || 0
                                        ).toLocaleString()}
                                    </strong>

                                </div>


                                <!-- APPLICATION -->

                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#6b7280;
                                            margin-bottom:4px;
                                        "
                                    >
                                        Application
                                    </small>

                                    <strong>
                                        ${escapeAdmissionsValue(
                                            applicationStatus
                                        )}
                                    </strong>

                                </div>


                                <!-- ADMISSION -->

                                <div>

                                    <small
                                        style="
                                            display:block;
                                            color:#6b7280;
                                            margin-bottom:4px;
                                        "
                                    >
                                        Admission
                                    </small>

                                    <strong>
                                        ${escapeAdmissionsValue(
                                            admissionStatus
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    /*------------------------------------------------------
       EXPAND / COLLAPSE
    ------------------------------------------------------*/

    table
        .querySelectorAll(
            ".operations-admission-expand"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    const targetId =
                        button.dataset.target;


                    const details =
                        document.getElementById(
                            targetId
                        );


                    if(!details) return;


                    const isOpen =
                        details.style.display !==
                        "none";


                    details.style.display =
                        isOpen
                            ? "none"
                            : "table-row";


                    const icon =
                        button.querySelector("i");


                    if(icon){

                        icon.className =
                            isOpen
                                ? "fa-solid fa-chevron-right"
                                : "fa-solid fa-chevron-down";

                    }

                }
            );

        });


    /*------------------------------------------------------
       CLICK WHOLE ROW
    ------------------------------------------------------*/

    table
        .querySelectorAll(
            ".operations-admission-row"
        )
        .forEach(row => {

            row.addEventListener(
                "click",
                () => {

                    const button =
                        row.querySelector(
                            ".operations-admission-expand"
                        );

                    button?.click();

                }
            );

        });

}


/*==========================================================
   ADMISSIONS TABLE PROFESSIONAL LAYOUT
==========================================================*/

(function styleAdmissionsStudentTable(){

    const admissionsTable =
        document.getElementById(
            "operationsAdmissionsStudentsTable"
        );

    if(!admissionsTable) return;


    /*------------------------------------------------------
       FIND TABLE ELEMENT
    ------------------------------------------------------*/

    const actualTable =
        admissionsTable.tagName.toLowerCase() === "table"
            ? admissionsTable
            : admissionsTable.closest("table");


    if(!actualTable) return;


    /*------------------------------------------------------
       FIND / CREATE SCROLL CONTAINER
    ------------------------------------------------------*/

    let scrollContainer =
        actualTable.closest(
            ".operations-admissions-scroll"
        );


    if(!scrollContainer){

        scrollContainer =
            document.createElement("div");

        scrollContainer.className =
            "operations-admissions-scroll";


        actualTable.parentNode.insertBefore(
            scrollContainer,
            actualTable
        );


        scrollContainer.appendChild(
            actualTable
        );

    }


    /*------------------------------------------------------
       SCROLL CONTAINER
    ------------------------------------------------------*/

    scrollContainer.style.cssText = `
        width:100%;
        max-height:560px;
        overflow-y:auto;
        overflow-x:auto;
        border-radius:14px;
        background:#ffffff;
        border:1px solid rgba(15,23,42,.08);
        box-sizing:border-box;
        scrollbar-width:thin;
    `;


    /*------------------------------------------------------
       TABLE
    ------------------------------------------------------*/

    actualTable.style.cssText += `
        width:100%;
        min-width:920px;
        border-collapse:separate;
        border-spacing:0;
        table-layout:fixed;
    `;


    /*------------------------------------------------------
       HEADER
    ------------------------------------------------------*/

    const header =
        actualTable.querySelector("thead");


    if(header){

        header.style.position =
            "sticky";

        header.style.top =
            "0";

        header.style.zIndex =
            "10";


        header
            .querySelectorAll("th")
            .forEach(th => {

                th.style.background =
                    "#ffffff";

                th.style.boxShadow =
                    "0 1px 0 rgba(15,23,42,.08)";

                th.style.position =
                    "sticky";

                th.style.top =
                    "0";

                th.style.zIndex =
                    "11";

                th.style.padding =
                    "15px 12px";

                th.style.whiteSpace =
                    "nowrap";

            });

    }


    /*------------------------------------------------------
       COLUMN WIDTHS
    ------------------------------------------------------*/

    const headers =
        actualTable.querySelectorAll(
            "thead th"
        );


    if(headers.length >= 7){

        headers[0].style.width = "22%";
        headers[1].style.width = "14%";
        headers[2].style.width = "11%";
        headers[3].style.width = "21%";
        headers[4].style.width = "11%";
        headers[5].style.width = "10%";
        headers[6].style.width = "11%";

    }


    /*------------------------------------------------------
       ROW STYLING
    ------------------------------------------------------*/

    function styleRows(){

        actualTable
            .querySelectorAll(
                "tbody > tr"
            )
            .forEach(row => {

                if(
                    row.classList.contains(
                        "operations-admission-details"
                    )
                ){
                    return;
                }


                row.style.transition =
                    "background .18s ease";


                row
                    .querySelectorAll("td")
                    .forEach(td => {

                        td.style.padding =
                            "15px 12px";

                        td.style.verticalAlign =
                            "middle";

                        td.style.borderBottom =
                            "1px solid rgba(15,23,42,.06)";

                        td.style.overflow =
                            "hidden";

                        td.style.textOverflow =
                            "ellipsis";

                        td.style.whiteSpace =
                            "nowrap";

                    });


                row.addEventListener(
                    "mouseenter",
                    () => {

                        row.style.background =
                            "#f8fafc";

                    }
                );


                row.addEventListener(
                    "mouseleave",
                    () => {

                        row.style.background =
                            "";

                    }
                );

            });


        /*--------------------------------------------------
           EXPANDED DETAILS
        --------------------------------------------------*/

        actualTable
            .querySelectorAll(
                ".operations-admission-details"
            )
            .forEach(details => {

                details
                    .querySelectorAll("td")
                    .forEach(td => {

                        td.style.whiteSpace =
                            "normal";

                        td.style.overflow =
                            "visible";

                    });

            });

    }


    styleRows();


    /*------------------------------------------------------
       RESPONSIVE MOBILE SUPPORT
    ------------------------------------------------------*/

    if(
        !document.getElementById(
            "operationsAdmissionsTableResponsiveStyle"
        )
    ){

        const style =
            document.createElement("style");

        style.id =
            "operationsAdmissionsTableResponsiveStyle";


        style.textContent = `

            .operations-admissions-scroll::-webkit-scrollbar{
                width:7px;
                height:7px;
            }

            .operations-admissions-scroll::-webkit-scrollbar-thumb{
                background:rgba(15,43,82,.25);
                border-radius:20px;
            }

            .operations-admissions-scroll::-webkit-scrollbar-track{
                background:transparent;
            }


            @media(max-width:900px){

                .operations-admissions-scroll{
                    max-height:500px !important;
                }

            }


            @media(max-width:650px){

                .operations-admissions-scroll{
                    max-height:460px !important;
                }

            }

        `;


        document.head.appendChild(style);

    }

})();


/*----------------------------------------------------------
   EMPTY DATA
----------------------------------------------------------*/

if(students.length === 0){

    table.innerHTML = `
        <tr>

            <td
                colspan="7"
                style="
                    text-align:center;
                    padding:30px;
                    opacity:.6;
                "
            >
                No admissions records yet.
                Import the Excel file to begin.
            </td>

        </tr>
    `;

}else{

    renderFilteredAdmissions();

}

    }catch(error){

        console.error(
            "OPERATIONS ADMISSIONS ERROR:",
            error
        );


        const status =
            document.getElementById(
                "operationsAdmissionsImportStatus"
            );


        if(status){

            status.textContent =
                "Unable to load admissions data.";

        }

    }

}


/*==========================================================
   CREATE DASHBOARD ON PAGE LOAD
==========================================================*/

createAdmissionsDashboard();

loadOperationsAdmissions();


/*==========================================================
   REFRESH BUTTON
==========================================================*/

document.addEventListener(
    "click",
    event => {

        if(
            event.target.closest(
                "#operationsAdmissionsRefresh"
            )
        ){

            loadOperationsAdmissions();

        }

    }
);


/*==========================================================
   ADMISSIONS EXCEL IMPORT MODAL
==========================================================*/

function createAdmissionsImportModal(){

    /* Prevent duplicate modal */

    if(document.getElementById("operationsAdmissionsImportModal")){
        return;
    }


    const modal = document.createElement("div");

    modal.id = "operationsAdmissionsImportModal";


    modal.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99999;
        display:none;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(0,0,0,.65);
        backdrop-filter:blur(5px);
    `;


    modal.innerHTML = `

        <div
            style="
                width:100%;
                max-width:600px;
                max-height:90vh;
                overflow:auto;
                background:#ffffff;
                color:#111827;
                border-radius:18px;
                padding:25px;
                box-sizing:border-box;
                box-shadow:0 25px 80px rgba(0,0,0,.35);
            "
        >

            <!-- HEADER -->

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:15px;
                    margin-bottom:20px;
                "
            >

                <div>

                    <h2
                        style="
                            margin:0;
                            font-size:21px;
                        "
                    >

                        <i
                            class="fa-solid fa-file-excel"
                        ></i>

                        Import Admissions Excel

                    </h2>


                    <p
                        style="
                            margin:6px 0 0;
                            font-size:13px;
                            color:#6b7280;
                        "
                    >

                        Upload the latest sales/admissions
                        Excel file.

                    </p>

                </div>


                <button
                    type="button"
                    id="closeOperationsAdmissionsImport"
                    style="
                        border:0;
                        background:transparent;
                        font-size:26px;
                        cursor:pointer;
                        color:#6b7280;
                    "
                >

                    &times;

                </button>

            </div>


            <!-- INFORMATION -->

            <div
                style="
                    padding:14px;
                    border-radius:12px;
                    background:#f3f4f6;
                    margin-bottom:18px;
                    font-size:13px;
                    line-height:1.6;
                "
            >

                <strong>
                    Excel columns required:
                </strong>

                <br>

                Student ID,
                Student Name,
                Sales Agent,
                Destination Country,
                University,
                Gouldings Course,
                Application Status,
                Offer Status,
                Admission Status,
                Revenue

            </div>


            <!-- FILE -->

            <label
                for="operationsAdmissionsExcelFile"
                style="
                    display:block;
                    font-weight:600;
                    margin-bottom:8px;
                "
            >

                Select Excel file

            </label>


            <input
                id="operationsAdmissionsExcelFile"
                type="file"
                accept=".xlsx,.xls"
                style="
                    display:block;
                    width:100%;
                    padding:12px;
                    border:1px solid #d1d5db;
                    border-radius:10px;
                    box-sizing:border-box;
                    background:#fff;
                "
            />


            <!-- SELECTED FILE -->

            <div
                id="operationsAdmissionsSelectedFile"
                style="
                    margin-top:10px;
                    font-size:12px;
                    color:#6b7280;
                "
            >

                No file selected.

            </div>


            <!-- RESULT -->

            <div
                id="operationsAdmissionsImportResult"
                style="
                    display:none;
                    margin-top:15px;
                    padding:13px;
                    border-radius:10px;
                    font-size:13px;
                    line-height:1.6;
                "
            ></div>


            <!-- FOOTER -->

            <div
                style="
                    display:flex;
                    justify-content:flex-end;
                    gap:10px;
                    margin-top:22px;
                "
            >

                <button
                    type="button"
                    id="cancelOperationsAdmissionsImport"
                    class="link-btn"
                >

                    Cancel

                </button>


                <button
                    type="button"
                    id="submitOperationsAdmissionsImport"
                    class="primary-btn"
                >

                    <i
                        class="fa-solid fa-cloud-arrow-up"
                    ></i>

                    Import Excel

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    /*======================================================
       REFERENCES
    ======================================================*/

    const fileInput =
        document.getElementById(
            "operationsAdmissionsExcelFile"
        );


    const selectedFile =
        document.getElementById(
            "operationsAdmissionsSelectedFile"
        );


    const result =
        document.getElementById(
            "operationsAdmissionsImportResult"
        );


    const importButton =
        document.getElementById(
            "submitOperationsAdmissionsImport"
        );


    const closeButton =
        document.getElementById(
            "closeOperationsAdmissionsImport"
        );


    const cancelButton =
        document.getElementById(
            "cancelOperationsAdmissionsImport"
        );


    /*======================================================
       OPEN
    ======================================================*/

    function openModal(){

        modal.style.display="flex";

        result.style.display="none";

        result.innerHTML="";

        if(fileInput){

            fileInput.value="";

        }

        if(selectedFile){

            selectedFile.textContent=
                "No file selected.";

        }

    }


    /*======================================================
       CLOSE
    ======================================================*/

    function closeModal(){

        modal.style.display="none";

    }


    /*======================================================
       FILE SELECTED
    ======================================================*/

    fileInput?.addEventListener(
        "change",
        ()=>{

            if(!fileInput.files.length){

                selectedFile.textContent=
                    "No file selected.";

                return;

            }


            const file =
                fileInput.files[0];


            selectedFile.textContent =
                `Selected: ${file.name}`;


            result.style.display="none";

        }
    );


    /*======================================================
       IMPORT
    ======================================================*/

    importButton?.addEventListener(
        "click",
        async ()=>{

            if(!fileInput.files.length){

                result.style.display="block";

                result.style.background="#fee2e2";

                result.style.color="#991b1b";

                result.textContent =
                    "Please select an Excel file first.";

                return;

            }


            const file =
                fileInput.files[0];


            const filename =
                file.name.toLowerCase();


            if(
                !filename.endsWith(".xlsx") &&
                !filename.endsWith(".xls")
            ){

                result.style.display="block";

                result.style.background="#fee2e2";

                result.style.color="#991b1b";

                result.textContent =
                    "Only .xlsx and .xls files are supported.";

                return;

            }


            /*----------------------------------------------
               FORM DATA
            ----------------------------------------------*/

            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            /*----------------------------------------------
               BUTTON STATE
            ----------------------------------------------*/

            importButton.disabled=true;


            importButton.innerHTML = `

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Importing...

            `;


            result.style.display="block";

            result.style.background="#f3f4f6";

            result.style.color="#374151";

            result.textContent =
                "Uploading and processing Excel file...";


            try{

                /*------------------------------------------
                   SEND TO BACKEND
                ------------------------------------------*/

                const response =
                    await fetch(
                        `${OPERATIONS_ADMISSIONS_API}/admissions/import`,
                        {
                            method:"POST",
                            body:formData
                        }
                    );


                const data =
                    await response.json();


                if(
                    !response.ok ||
                    !data.success
                ){

                    throw new Error(
                        data.message ||
                        "Excel import failed."
                    );

                }


                /*------------------------------------------
                   IMPORT RESULT
                ------------------------------------------*/

                const imported =
                    data.import || {};


                result.style.background =
                    "#dcfce7";


                result.style.color =
                    "#166534";


                result.innerHTML = `

                    <strong>
                        Import successful!
                    </strong>

                    <br><br>

                    Records processed:
                    <strong>
                        ${Number(
                            imported.recordsProcessed || 0
                        )}
                    </strong>

                    <br>

                    New records:
                    <strong>
                        ${Number(
                            imported.newRecords || 0
                        )}
                    </strong>

                    <br>

                    Updated records:
                    <strong>
                        ${Number(
                            imported.updatedRecords || 0
                        )}
                    </strong>

                    <br>

                    Errors:
                    <strong>
                        ${Number(
                            imported.errorCount || 0
                        )}
                    </strong>

                `;


                /*------------------------------------------
                   REFRESH DASHBOARD
                ------------------------------------------*/

                await loadOperationsAdmissions();


            }catch(error){

                console.error(
                    "ADMISSIONS IMPORT ERROR:",
                    error
                );


                result.style.display="block";

                result.style.background =
                    "#fee2e2";


                result.style.color =
                    "#991b1b";


                result.innerHTML = `

                    <strong>
                        Import failed.
                    </strong>

                    <br>

                    ${escapeAdmissionsValue(
                        error.message
                    )}

                `;


            }finally{

                importButton.disabled=false;


                importButton.innerHTML = `

                    <i
                        class="fa-solid fa-cloud-arrow-up"
                    ></i>

                    Import Excel

                `;

            }

        }
    );


    /*======================================================
       CLOSE BUTTONS
    ======================================================*/

    closeButton?.addEventListener(
        "click",
        closeModal
    );


    cancelButton?.addEventListener(
        "click",
        closeModal
    );


    /*======================================================
       CLICK OUTSIDE
    ======================================================*/

    modal.addEventListener(
        "click",
        event=>{

            if(event.target===modal){

                closeModal();

            }

        }
    );


    /*======================================================
       ESC
    ======================================================*/

    document.addEventListener(
        "keydown",
        event=>{

            if(
                event.key==="Escape" &&
                modal.style.display==="flex"
            ){

                closeModal();

            }

        }
    );


    /*======================================================
       CONNECT DASHBOARD BUTTON
    ======================================================*/

    document.addEventListener(
        "click",
        event=>{

            const button =
                event.target.closest(
                    "#operationsAdmissionsImport"
                );


            if(button){

                openModal();

            }

        }
    );

}


/*==========================================================
   START IMPORT SYSTEM
==========================================================*/

createAdmissionsImportModal();

/*==========================================================
STATISTICS
==========================================================*/

/*==========================================================
   TEAM PERFORMANCE
   Uses the same live admissions data as
   University Admissions Progress
==========================================================*/

/*==========================================================
   TEAM PERFORMANCE
   LIVE DATA FROM OPERATIONS ADMISSIONS DASHBOARD
==========================================================*/

async function updateStatistics() {

    try {

        /*======================================================
           LOAD THE SAME LIVE DATA USED BY
           UNIVERSITY ADMISSIONS PROGRESS
        ======================================================*/

        const response = await fetch(
            `${OPERATIONS_ADMISSIONS_API}/dashboard`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `Operations dashboard returned ${response.status}`
            );
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message || "Failed to load admissions data"
            );
        }


        /*======================================================
           LIVE SUMMARY
        ======================================================*/

        const summary = data.summary || {};

        const applications =
            Number(summary.applications || 0);

        const admissions =
            Number(summary.admissions || 0);

        const revenue =
            Number(summary.revenue || 0);


        /*======================================================
           FIND THE TEAM PERFORMANCE CARD SPECIFICALLY
           
           IMPORTANT:
           We do NOT use document.querySelector('.stat-box...')
           globally because other sections can contain metric
           boxes as well.
        ======================================================*/

        const teamPerformanceCard =
            Array.from(
                document.querySelectorAll(".glass-card")
            ).find(card => {

                const heading =
                    card.querySelector(".card-title h3");

                return heading &&
                    heading.textContent.trim()
                        .toLowerCase() === "team performance";

            });


        if (!teamPerformanceCard) {

            console.warn(
                "Team Performance card not found."
            );

            return;

        }


        /*======================================================
           FIND ONLY THE METRICS INSIDE TEAM PERFORMANCE
        ======================================================*/

        const applicationBox =
            teamPerformanceCard.querySelector(
            
                '.stat-box[data-operations-metric="applications"] span'
            );

        const admissionBox =
            teamPerformanceCard.querySelector(
                '.stat-box[data-operations-metric="admissions"] span'
            );

        const revenueBox =
            teamPerformanceCard.querySelector(
                '.stat-box[data-operations-metric="revenue"] span'
            );

        const responseBox =
            teamPerformanceCard.querySelector(
                '.stat-box[data-metric="response"] span'
            );


        /*======================================================
           UPDATE APPLICATIONS
        ======================================================*/

        if (applicationBox) {

            applicationBox.textContent =
                applications.toLocaleString();

        }


        /*======================================================
           UPDATE ADMISSIONS
        ======================================================*/

        if (admissionBox) {

            admissionBox.textContent =
                admissions.toLocaleString();

        }


        /*======================================================
           UPDATE REVENUE
        ======================================================*/

        if (revenueBox) {

            revenueBox.textContent =
                "£" +
                revenue.toLocaleString();

        }


        /*======================================================
           RESPONSE RATE
           
           This is still supplied by the existing
           team-performance endpoint.

           If that endpoint fails, we leave the current
           response-rate value alone instead of falsely
           displaying a value calculated from admissions.
        ======================================================*/

        if (responseBox) {

            try {

                const responseRateResponse =
                    await fetch(
                        "http://localhost:5000/api/team-performance",
                        {
                            method: "GET",
                            cache: "no-store"
                        }
                    );

                if (responseRateResponse.ok) {

                    const teamData =
                        await responseRateResponse.json();

                    if (
                        teamData.success &&
                        teamData.responseRate !== undefined
                    ) {

                        responseBox.textContent =
                            Number(
                                teamData.responseRate
                            ) + "%";

                    }

                } else {

                    console.warn(
                        "Response rate endpoint returned:",
                        responseRateResponse.status
                    );

                }

            } catch (responseError) {

                console.warn(
                    "Response rate unavailable:",
                    responseError
                );

            }

        }


        /*======================================================
           DEBUG
        ======================================================*/

        console.log(
            "TEAM PERFORMANCE UPDATED:",
            {
                applications,
                admissions,
                revenue
            }
        );

    } catch (error) {

        console.error(
            "Failed to load Team Performance:",
            error
        );

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

// ============================================================
// SALES TARGETS & GOALS
// ============================================================

// ============================================================
// SALES TARGETS & GOALS
// ============================================================

async function loadOperationsGoals() {
    const goalsContainer = document.getElementById("goalsContainer");

    if (!goalsContainer) {
        console.warn("goalsContainer not ready. Retrying...");
        setTimeout(loadOperationsGoals, 500);
        return;
    }

    goalsContainer.innerHTML = `
        <div style="padding:20px 0;color:#6b7280;">
            Loading goals...
        </div>
    `;

    try {
        const response = await fetch(
            "http://localhost:5000/api/goals"
        );

        if (!response.ok) {
            throw new Error(
                `Goals API returned ${response.status}`
            );
        }

        const data = await response.json();

        console.log(
            "GOALS DATA FULL:",
            JSON.stringify(data, null, 2)
        );

        console.log("GOALS DATA:", data);

        // API returns one goals object
        const goal = data;

        if (!goal || !goal.id) {
            goalsContainer.innerHTML = `
                <div style="padding:20px 0;color:#6b7280;">
                    No sales targets have been set yet.
                </div>
            `;
            return;
        }

        const admissionsActual =
            Number(goal.admissions_actual || 0);

        const admissionsTarget =
            Number(goal.admissions_target || 0);

        const applicationsActual =
            Number(goal.applications_actual || 0);

        const applicationsTarget =
            Number(goal.applications_target || 0);

        const enrolmentActual =
            Number(goal.enrolment_actual || 0);

        const enrolmentTarget =
            Number(goal.enrolment_target || 0);

        const admissionsPercent =
            admissionsTarget > 0
                ? Math.min(
                    100,
                    Math.round(
                        (admissionsActual / admissionsTarget) * 100
                    )
                )
                : 0;

        const applicationsPercent =
            applicationsTarget > 0
                ? Math.min(
                    100,
                    Math.round(
                        (applicationsActual / applicationsTarget) * 100
                    )
                )
                : 0;

        const enrolmentPercent =
            enrolmentTarget > 0
                ? Math.min(
                    100,
                    Math.round(
                        (enrolmentActual / enrolmentTarget) * 100
                    )
                )
                : 0;

        // Render goals
        goalsContainer.innerHTML = `
            <div class="goals-grid">

                <!-- APPLICATIONS -->
                <div class="operations-goal-card">
                    <div class="goal-card-top">
                        <div>
                            <strong>Applications</strong>
                            <span>
                                ${applicationsActual} / ${applicationsTarget}
                            </span>
                        </div>

                        <div class="goal-percentage">
                            ${applicationsPercent}%
                        </div>
                    </div>

                    <div class="goal-progress">
                        <div
                            class="goal-progress-fill"
                            style="width:${applicationsPercent}%"
                        ></div>
                    </div>
                </div>


                <!-- ADMISSIONS -->
                <div class="operations-goal-card">
                    <div class="goal-card-top">
                        <div>
                            <strong>Admissions</strong>
                            <span>
                                ${admissionsActual} / ${admissionsTarget}
                            </span>
                        </div>

                        <div class="goal-percentage">
                            ${admissionsPercent}%
                        </div>
                    </div>

                    <div class="goal-progress">
                        <div
                            class="goal-progress-fill"
                            style="width:${admissionsPercent}%"
                        ></div>
                    </div>
                </div>


                <!-- ENROLMENT -->
                <div class="operations-goal-card">
                    <div class="goal-card-top">
                        <div>
                            <strong>Enrolment</strong>
                            <span>
                                ${enrolmentActual} / ${enrolmentTarget}
                            </span>
                        </div>

                        <div class="goal-percentage">
                            ${enrolmentPercent}%
                        </div>
                    </div>

                    <div class="goal-progress">
                        <div
                            class="goal-progress-fill"
                            style="width:${enrolmentPercent}%"
                        ></div>
                    </div>
                </div>

            </div>
        `;

    } catch (error) {

        console.error("GOALS FETCH ERROR:", error);

        goalsContainer.innerHTML = `
            <div style="padding:20px 0;color:#b91c1c;">
                Unable to load sales targets.
            </div>
        `;
    }
}


// ============================================================
// LOAD SALES TARGETS & GOALS
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    loadOperationsGoals();
});



// ============================================================
// LOAD SALES TARGETS & GOALS
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    loadOperationsGoals();
});

