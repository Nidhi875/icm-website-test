let currentDate = new Date();

let selectedDate = "";

let editingIndex = null;

let events = JSON.parse(localStorage.getItem("staffCalendarEvents")) || [];

const monthYear = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendarGrid");

const modal = document.getElementById("eventModal");

const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventLocation = document.getElementById("eventLocation");
const eventDescription = document.getElementById("eventDescription");
const eventColour = document.getElementById("eventColour");

function saveStorage(){

localStorage.setItem(

"staffCalendarEvents",

JSON.stringify(events)

);

}

function formatDate(date){

return date.getFullYear()+"-"+

String(date.getMonth()+1).padStart(2,"0")+"-"+

String(date.getDate()).padStart(2,"0");

}

function renderCalendar(){

calendarGrid.innerHTML="";

monthYear.innerHTML=currentDate.toLocaleString(

"default",

{

month:"long",

year:"numeric"

}

);

const year=currentDate.getFullYear();

const month=currentDate.getMonth();

let firstDay=new Date(year,month,1).getDay();

firstDay=(firstDay===0)?6:firstDay-1;

const daysInMonth=new Date(year,month+1,0).getDate();

const prevMonthDays=new Date(year,month,0).getDate();

for(let i=firstDay;i>0;i--){

const div=document.createElement("div");

div.className="day inactive";

div.innerHTML=

"<div class='date-number'>"+

(prevMonthDays-i+1)+

"</div>";

calendarGrid.appendChild(div);

}

for(let day=1;day<=daysInMonth;day++){

const div=document.createElement("div");

div.className="day";

const fullDate=

year+"-"+

String(month+1).padStart(2,"0")+"-"+

String(day).padStart(2,"0");

const today=formatDate(new Date());

if(fullDate===today){

div.classList.add("today");

}

let html="<div class='date-number'>"+day+"</div>";

html+="<div class='events'>";

events.forEach((ev,index)=>{

if(ev.date===fullDate){

html+="<div class='event "+ev.colour+"' data-index='"+index+"'>";

html+=ev.time?ev.time+" ":"";

html+=ev.title;

html+="</div>";

}

});

html+="</div>";

div.innerHTML=html;

div.addEventListener("click",function(e){

if(e.target.classList.contains("event")) return;

openNewEvent(fullDate);

});

calendarGrid.appendChild(div);

}

const totalCells=calendarGrid.children.length;

const remain=42-totalCells;

for(let i=1;i<=remain;i++){

const div=document.createElement("div");

div.className="day inactive";

div.innerHTML="<div class='date-number'>"+i+"</div>";

calendarGrid.appendChild(div);

}

document.querySelectorAll(".event").forEach(item=>{

item.onclick=function(e){

e.stopPropagation();

editEvent(

parseInt(this.dataset.index)

);

};

});

}

function openNewEvent(date){

editingIndex=null;

selectedDate=date;

eventTitle.value="";

eventDate.value=date;

eventTime.value="";

eventLocation.value="";

eventDescription.value="";

eventColour.value="gold";

modal.classList.add("show");

}

function editEvent(index){

editingIndex=index;

const ev=events[index];

eventTitle.value=ev.title;

eventDate.value=ev.date;

eventTime.value=ev.time;

eventLocation.value=ev.location;

eventDescription.value=ev.description;

eventColour.value=ev.colour;

modal.classList.add("show");

}

document.getElementById("saveEvent").onclick=function(){

const obj={

title:eventTitle.value,

date:eventDate.value,

time:eventTime.value,

location:eventLocation.value,

description:eventDescription.value,

colour:eventColour.value

};

if(editingIndex===null){

events.push(obj);

}else{

events[editingIndex]=obj;

}

saveStorage();

modal.classList.remove("show");

renderCalendar();

};

document.getElementById("deleteEvent").onclick=function(){

if(editingIndex!==null){

events.splice(editingIndex,1);

saveStorage();

}

modal.classList.remove("show");

renderCalendar();

};

document.getElementById("closeModal").onclick=function(){

modal.classList.remove("show");

};

window.onclick=function(e){

if(e.target===modal){

modal.classList.remove("show");

}

};

document.getElementById("prevMonth").onclick=function(){

currentDate.setMonth(currentDate.getMonth()-1);

renderCalendar();

};

document.getElementById("nextMonth").onclick=function(){

currentDate.setMonth(currentDate.getMonth()+1);

renderCalendar();

};

document.getElementById("todayBtn").onclick=function(){

currentDate=new Date();

renderCalendar();

};

renderCalendar();
