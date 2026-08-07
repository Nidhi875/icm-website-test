/*==================================================
GOULDINGS STAFF LMS
MEETINGS MANAGEMENT
==================================================*/

let filteredMeetings = [];

/*==================================================
INITIALISE
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initialiseMeetingStorage();

    filteredMeetings = getMeetings();

    renderMeetings();

    updateStatistics();

    initialiseFilters();

    initialiseCreateMeeting();

});


/*==================================================
GET MEETINGS
==================================================*/

function refreshMeetings(){

    filteredMeetings = getMeetings();

}

/*==================================================
MEETING CARD TEMPLATE
==================================================*/

function createMeetingCard(meeting){

    return `

    <div class="meeting-card"
         onclick="joinMeeting(${meeting.id})"
         style="cursor:pointer;">

        <div class="meeting-left">

            <div class="meeting-icon">

                <i class="fa-solid fa-video"></i>

            </div>

            <div class="meeting-content">

                <div class="meeting-top">

                    <span class="meeting-status ${String(meeting.status || "").toLowerCase()}">

                        ${meeting.status || "UPCOMING"}

                    </span>

                    <span class="meeting-platform ${meeting.badge}">

                        ${meeting.platform}

                    </span>

                </div>

                <h3>${meeting.title}</h3>

                <p>${meeting.tutor}</p>

                <div class="meeting-meta">

                    <span>${meeting.date}</span>

                    <span>•</span>

                    <span>${meeting.time}</span>

                    <span>•</span>

                    <span>${meeting.duration} mins</span>

                    <span>•</span>

                    <span>${meeting.attendees} Participants</span>

                </div>

            </div>

        </div>

        <div class="meeting-actions">

            <button
                class="join-btn"
                onclick="event.stopPropagation(); joinMeeting(${meeting.id})">

                <i class="fa-solid fa-video"></i>

                Join

            </button>

            <button
                class="icon-btn"
                onclick="event.stopPropagation(); editMeeting(${meeting.id})">

                <i class="fa-solid fa-pen"></i>

            </button>

            <button
                class="icon-btn"
                onclick="event.stopPropagation(); deleteMeeting(${meeting.id})">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

    </div>

    `;

}

/*==================================================
RENDER
==================================================*/

function renderMeetings(){

    refreshMeetings();

    console.log(filteredMeetings);

console.table(filteredMeetings);

    console.log("Meetings loaded:", filteredMeetings);
console.log("Number of meetings:", filteredMeetings.length);

    const container = document.getElementById("meetingsList");

    if(!container) return;

    if(filteredMeetings.length===0){

        container.innerHTML=`

        <div class="empty-state">

            <h3>No meetings found</h3>

            <p>Create your first meeting.</p>

        </div>

        `;

        return;

    }

   container.innerHTML = filteredMeetings
    .map(createMeetingCard)
    .join("");

    console.log("Cards rendered:", container.children.length);

}

/*==================================================
STATISTICS
==================================================*/

function updateStatistics(){

    const meetings = getMeetings();

    const total =
        meetings.length;

    const live =
        meetings.filter(m=>m.status==="LIVE").length;

    const completed =
        meetings.filter(m=>m.status==="COMPLETED").length;

    const upcoming =
        total-live-completed;

    document.getElementById("totalMeetings").textContent =
        total;

    document.getElementById("liveMeetings").textContent =
        live;

    document.getElementById("upcomingMeetings").textContent =
        upcoming;

    document.getElementById("completedMeetings").textContent =
        completed;

}


/*==================================================
FILTERS
==================================================*/

function initialiseFilters(){

    const search =
        document.getElementById("meetingSearch");

    if(search){

        search.addEventListener("input",filterMeetings);

    }

    const provider =
        document.getElementById("providerFilter");

    if(provider){

        provider.addEventListener("change",filterMeetings);

    }

    const status =
        document.getElementById("statusFilter");

    if(status){

        status.addEventListener("change",filterMeetings);

    }

}


/*==================================================
FILTER MEETINGS
==================================================*/

function filterMeetings(){

    const keyword =
        document.getElementById("meetingSearch")?.value.toLowerCase() || "";

    const provider =
        document.getElementById("providerFilter")?.value || "";

    const status =
        document.getElementById("statusFilter")?.value || "";

    filteredMeetings = getMeetings().filter(meeting=>{

        const matchesSearch =

            meeting.title.toLowerCase().includes(keyword) ||

            meeting.tutor.toLowerCase().includes(keyword);

        const matchesProvider =

            !provider ||

            meeting.provider===provider;

        const matchesStatus =

            !status ||

            meeting.status===status;

        return matchesSearch &&
               matchesProvider &&
               matchesStatus;

    });

    renderFilteredMeetings();

}


/*==================================================
RENDER FILTERED
==================================================*/

/*==================================================
RENDER FILTERED
==================================================*/

function renderFilteredMeetings(){

    const container =
        document.getElementById("meetingsList");

    if(!container) return;

    if(filteredMeetings.length===0){

        container.innerHTML = `

            <div class="empty-state">

                <h3>No meetings found</h3>

                <p>No meetings match your search.</p>

            </div>

        `;

        return;

    }

    container.innerHTML = filteredMeetings
    .map(createMeetingCard)
    .join("");
}


function joinMeeting(id){

    window.location.href = `meeting-room.html?id=${id}`;

}