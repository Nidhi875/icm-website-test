/*==================================================
GOULDINGS STAFF LMS
MEETINGS MANAGEMENT
==================================================*/

let filteredMeetings = [];

let editingMeetingId = null;


/* ==================================================
   SYNC MEETINGS CREATED FROM MESSAGES PAGE
================================================== */

function syncSharedMeetings() {

    const sharedKey = "staff-lms-meetings";

    let sharedMeetings = [];

    try {
        sharedMeetings = JSON.parse(
            localStorage.getItem(sharedKey) || "[]"
        );

        if (!Array.isArray(sharedMeetings)) {
            sharedMeetings = [];
        }

    } catch (error) {
        console.error(
            "Unable to read shared meetings:",
            error
        );

        sharedMeetings = [];
    }

    console.log(
        "SHARED MEETINGS FROM MESSAGES:",
        sharedMeetings
    );

    /*
       Make sure every meeting has the fields
       expected by the Meetings page.
    */

    sharedMeetings = sharedMeetings.map(meeting => ({

        id: meeting.id || Date.now(),

        title: meeting.title || "Untitled Meeting",

        tutor: meeting.tutor || "Claire",

        date: meeting.date || "",

        time: meeting.time || "",

        duration: meeting.duration || 60,

        provider: meeting.provider || "meet",

        platform: meeting.platform || "Google Meet",

        badge: meeting.badge || "meet",

        status: meeting.status || "UPCOMING",

        attendees: meeting.attendees || 0,

        meetingId: meeting.meetingId || "",

        meetingPassword:
            meeting.meetingPassword || "",

        join: meeting.join || "#",

        description:
            meeting.description || "",

        createdAt:
            meeting.createdAt ||
            new Date().toISOString()

    }));

    localStorage.setItem(
        sharedKey,
        JSON.stringify(sharedMeetings)
    );

    return sharedMeetings;
}

/*==================================================
INITIALISE
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    console.log("MEETINGS PAGE STARTED");

    initialiseMeetingStorage();

    const sharedMeetings =
        syncSharedMeetings();

    filteredMeetings =
        sharedMeetings;

    renderMeetings();

    updateStatistics();

    initialiseFilters();


});

/*==================================================
GET MEETINGS
==================================================*/

function refreshMeetings(){

    filteredMeetings = syncSharedMeetings();

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

    <div class="meeting-menu">

        <button
            class="menu-btn"
            onclick="event.stopPropagation(); toggleMeetingMenu(${meeting.id})">

            <i class="fa-solid fa-ellipsis-vertical"></i>

        </button>

        <div
            class="meeting-dropdown"
            id="meeting-menu-${meeting.id}">

            <button
                onclick="event.stopPropagation(); editMeeting(${meeting.id})">

                <i class="fa-solid fa-pen"></i>
                Edit Meeting

            </button>

            <button
                onclick="event.stopPropagation(); deleteMeeting(${meeting.id})">

                <i class="fa-solid fa-trash"></i>
                Delete Meeting

            </button>

        </div>

    </div>

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



/*==================================================
EDIT MEETING
==================================================*/

/*==================================================
EDIT MEETING
==================================================*/

function editMeeting(id) {

    console.log("EDIT MEETING CLICKED:", id);

    const sharedKey = "staff-lms-meetings";

    let meetings = [];

    try {
        meetings = JSON.parse(
            localStorage.getItem(sharedKey) || "[]"
        );
    } catch (error) {
        console.error("Unable to read meetings:", error);
        alert("Unable to load meeting.");
        return;
    }

    const meeting = meetings.find(
        m => String(m.id) === String(id)
    );

    if (!meeting) {
        console.error("Meeting not found:", id);
        console.table(meetings);
        alert("Meeting not found.");
        return;
    }

    console.log("MEETING TO EDIT:", meeting);

    editingMeetingId = meeting.id;

    const title =
        document.getElementById("meetingTitle");

    const tutor =
        document.getElementById("meetingTutor");

    const date =
        document.getElementById("meetingDate");

    const time =
        document.getElementById("meetingTime");

    const duration =
        document.getElementById("meetingDuration");

    const provider =
        document.getElementById("meetingProvider");

    if (title) {
        title.value = meeting.title || "";
    }

    if (tutor) {
        tutor.value = meeting.tutor || "Claire";
    }

    if (date) {
        date.value = meeting.date || "";
    }

    if (time) {
        time.value = meeting.time || "";
    }

    if (duration) {
        duration.value = meeting.duration || 60;
    }

    if (provider) {
        provider.value = meeting.provider || "meet";
    }

    const modal =
        document.getElementById("meetingModal");

    if (!modal) {
        console.error("meetingModal not found.");
        alert("Meeting editor could not be opened.");
        return;
    }

    modal.classList.add("show");

    console.log(
        "EDIT MODE:",
        editingMeetingId
    );
}

function toggleMeetingMenu(id){

    document
        .querySelectorAll(".meeting-dropdown")
        .forEach(menu=>{

            if(menu.id !== `meeting-menu-${id}`){

                menu.classList.remove("show");

            }

        });

    document
        .getElementById(`meeting-menu-${id}`)
        .classList.toggle("show");

}

/*==================================================
DELETE MEETING
==================================================*/

/*==================================================
DELETE MEETING
==================================================*/

function deleteMeeting(id) {

    if (!confirm("Delete this meeting?")) {
        return;
    }

    const sharedKey = "staff-lms-meetings";

    let meetings = [];

    try {
        meetings = JSON.parse(
            localStorage.getItem(sharedKey) || "[]"
        );

        if (!Array.isArray(meetings)) {
            meetings = [];
        }

    } catch (error) {

        console.error(
            "Unable to read meetings before deletion:",
            error
        );

        return;
    }


    /* Remove the selected meeting */

    const updatedMeetings = meetings.filter(
        meeting =>
            String(meeting.id) !== String(id)
    );


    /* Save directly to the SAME storage
       used by the Messages page and Meetings page */

    localStorage.setItem(
        sharedKey,
        JSON.stringify(updatedMeetings)
    );


    /* Update the page without calling renderMeetings(),
       because renderMeetings() reloads the old shared data. */

    filteredMeetings = [...updatedMeetings];


    renderFilteredMeetings();

    updateStatistics();


    console.log(
        "MEETING DELETED SUCCESSFULLY:",
        id
    );

    console.log(
        "REMAINING MEETINGS:",
        updatedMeetings
    );
}

document.addEventListener("click",()=>{

    document
        .querySelectorAll(".meeting-dropdown")
        .forEach(menu=>menu.classList.remove("show"));

});


/*==================================================
SAVE / UPDATE MEETING
==================================================*/

function saveMeeting(e) {

    e.preventDefault();

    const title =
        document.getElementById("meetingTitle")?.value.trim();

    const tutor =
          document.getElementById("meetingTutor")?.value.trim()
    || "Claire";

    const date =
        document.getElementById("meetingDate")?.value;

    const time =
        document.getElementById("meetingTime")?.value;

    const duration =
        parseInt(
            document.getElementById("meetingDuration")?.value
        ) || 60;

    const provider =

         document.getElementById("meetingProvider")?.value || "meet";

    if (!title || !tutor || !date || !time) {
         alert("Please enter the meeting title, date and time.");
        return;
    }

    const providerMap = {

        jitsi: {
            platform: "Jitsi Meet",
            badge: "jitsi"
        },

        zoom: {
            platform: "Zoom",
            badge: "zoom"
        },

        teams: {
            platform: "Microsoft Teams",
            badge: "teams"
        },

        meet: {
            platform: "Google Meet",
            badge: "meet"
        }

    };

    const sharedKey = "staff-lms-meetings";

    let meetings = [];

    try {

        meetings = JSON.parse(
            localStorage.getItem(sharedKey) || "[]"
        );

        if (!Array.isArray(meetings)) {
            meetings = [];
        }

    } catch (error) {

        console.error(
            "Unable to read meetings:",
            error
        );

        alert("Unable to save meeting.");
        return;
    }


    /*==================================================
    UPDATE EXISTING MEETING
    ==================================================*/

    if (editingMeetingId !== null) {

        const index = meetings.findIndex(
            meeting =>
                String(meeting.id) ===
                String(editingMeetingId)
        );

        if (index === -1) {

            console.error(
                "Meeting not found while saving:",
                editingMeetingId
            );

            alert("Meeting could not be found.");
            return;
        }

        const oldMeeting = meetings[index];

        meetings[index] = {

            ...oldMeeting,

            title: title,

            tutor: tutor,

            date: date,

            time: time,

            duration: duration,

            provider: provider,

            platform:
                providerMap[provider]?.platform ||
                oldMeeting.platform ||
                "Google Meet",

            badge:
                providerMap[provider]?.badge ||
                oldMeeting.badge ||
                "meet"

        };

        console.log(
            "MEETING UPDATED:",
            meetings[index]
        );

        editingMeetingId = null;

    }

    /*==================================================
    CREATE NEW MEETING
    ==================================================*/

    else {

        meetings.unshift({

            id: Date.now(),

            title: title,

            tutor: tutor,

            date: date,

            time: time,

            duration: duration,

            provider: provider,

            platform:
                providerMap[provider]?.platform ||
                "Google Meet",

            badge:
                providerMap[provider]?.badge ||
                "meet",

            status: "UPCOMING",

            attendees: 0,

            meetingId: "",

            meetingPassword: "",

            join: "#",

            description: "",

            createdAt:
                new Date().toISOString()

        });

        console.log(
            "MEETING CREATED:",
            meetings[0]
        );
    }


    /*==================================================
    SAVE TO SHARED STORAGE
    ==================================================*/

    localStorage.setItem(
        sharedKey,
        JSON.stringify(meetings)
    );


    /*==================================================
    REFRESH PAGE
    ==================================================*/

    filteredMeetings = [...meetings];

    renderFilteredMeetings();

    updateStatistics();


    const modal =
        document.getElementById("meetingModal");

    if (modal) {
        modal.classList.remove("show");
    }

    if (e.target && typeof e.target.reset === "function") {
        e.target.reset();
    }

    console.log(
        "SHARED MEETINGS AFTER SAVE:",
        meetings
    );

    alert(
        editingMeetingId === null
            ? "Meeting created successfully."
            : "Meeting updated successfully."
    );
}


/*==========================================
    JOIN MEETING
==========================================*/

window.joinMeeting = function (id) {

    console.log("========== JOIN MEETING ==========");
    console.log("JOIN BUTTON ID:", id);

    let meetings = [];

    try {
        meetings = getMeetings();

        if (!Array.isArray(meetings)) {
            meetings = [];
        }

    } catch (error) {
        console.error("GET MEETINGS ERROR:", error);
        alert("Unable to load meeting information.");
        return;
    }

    console.log("MEETINGS AVAILABLE:", meetings);

    const meeting = meetings.find(
        m =>
            m &&
            m.id !== undefined &&
            m.id !== null &&
            String(m.id).trim() === String(id).trim()
    );

    console.log("SELECTED MEETING:", meeting);

    if (!meeting) {
        console.error("MEETING NOT FOUND:", id);
        console.error(
            "AVAILABLE IDS:",
            meetings.map(m => m.id)
        );

        alert("Meeting not found.");
        return;
    }

    const now = new Date();

    const meetingStart = new Date(
        `${meeting.date}T${meeting.time}:00`
    );

    const duration =
        Number(meeting.duration) || 60;

    const meetingEnd = new Date(
        meetingStart.getTime() +
        duration * 60000
    );

    /*==========================================
        NOT STARTED
    ==========================================*/

    if (now < meetingStart) {

        alert(
            `This meeting has not started yet.\n\n` +
            `Scheduled for ${meetingStart.toLocaleDateString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            )} at ${meetingStart.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
            })}.`
        );

        return;
    }

    /*==========================================
        ENDED
    ==========================================*/

    if (now >= meetingEnd) {

        alert("This meeting has already ended.");

        return;
    }

    /*==========================================
        LIVE — OPEN MEETING ROOM
    ==========================================*/

    console.log("OPENING MEETING:", meeting.id);

    window.location.href =
        `meeting-room.html?id=${encodeURIComponent(
            String(meeting.id)
        )}`;
};