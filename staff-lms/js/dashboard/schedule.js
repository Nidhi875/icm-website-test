/*==========================================
TODAY'S SCHEDULE
==========================================*/

const todaySchedule = [

{
    time:"09:00",
    course:"Business Management",
    tutor:"Dr. Sarah Johnson",
    status:"Live"
},

{
    time:"11:00",
    course:"Leadership",
    tutor:"Dr. James Walker",
    status:"Upcoming"
},

{
    time:"14:00",
    course:"Marketing",
    tutor:"Dr. Emily Brown",
    status:"Upcoming"
},

{
    time:"16:00",
    course:"Research Methods",
    tutor:"Dr. Adair Ford",
    status:"Completed"
}

];

function renderSchedule(){

    const list=document.getElementById("scheduleList");

    if(!list) return;

    list.innerHTML="";

    todaySchedule.forEach(item=>{

        list.innerHTML+=`

        <div class="schedule-item">

            <div class="schedule-time">

                ${item.time}

            </div>

            <div class="schedule-course">

                <h4>${item.course}</h4>

                <p>${item.tutor}</p>

            </div>

            <span class="schedule-status ${item.status.toLowerCase()}">

                ${item.status}

            </span>

        </div>

        `;

    });

}

document.addEventListener("DOMContentLoaded",renderSchedule);