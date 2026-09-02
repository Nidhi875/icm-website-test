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

        status: getCurrentMeetingStatus(meeting),

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
    CALCULATE CURRENT MEETING STATUS
==================================================*/

function getCurrentMeetingStatus(meeting) {

    if (!meeting || !meeting.date || !meeting.time) {
        return "UPCOMING";
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

    if (now < meetingStart) {
        return "UPCOMING";
    }

    if (now >= meetingStart && now < meetingEnd) {
        return "LIVE";
    }

    return "COMPLETED";
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

    console.log(
        "Meetings loaded:",
        filteredMeetings
    );

    console.log(
        "Number of meetings:",
        filteredMeetings.length
    );

    const container =
        document.getElementById("meetingsList");

    if(!container) return;

    if(filteredMeetings.length === 0){

        container.innerHTML = `

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

    console.log(
        "Cards rendered:",
        container.children.length
    );

}


/*==================================================
STATISTICS
==================================================*/

function updateStatistics(){

    const meetings = getMeetings().map(meeting => ({

        ...meeting,

        status:
            getCurrentMeetingStatus(meeting)

    }));

    const total =
        meetings.length;

    const live =
        meetings.filter(
            m => m.status === "LIVE"
        ).length;

    const completed =
        meetings.filter(
            m => m.status === "COMPLETED"
        ).length;

    const upcoming =
        meetings.filter(
            m => m.status === "UPCOMING"
        ).length;

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

        search.addEventListener(
            "input",
            filterMeetings
        );

    }


    const provider =
        document.getElementById("providerFilter");

    if(provider){

        provider.addEventListener(
            "change",
            filterMeetings
        );

    }


    const status =
        document.getElementById("statusFilter");

    if(status){

        status.addEventListener(
            "change",
            filterMeetings
        );

    }


    /*
    ==================================================
    QUICK FILTER BUTTONS
    ==================================================
    */

    document
        .querySelectorAll(".filter-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    /*
                    Remove active state
                    from every button
                    */

                    document
                        .querySelectorAll(".filter-btn")
                        .forEach(btn => {

                            btn.classList.remove(
                                "active"
                            );

                        });


                    /*
                    Activate clicked button
                    */

                    button.classList.add(
                        "active"
                    );


                    /*
                    Get selected filter
                    */

                    const selectedFilter =
                        (
                            button.dataset.filter ||
                            "all"
                        )
                        .trim()
                        .toLowerCase();


                    /*
                    Keep the top status
                    dropdown synchronized
                    */

                    if(status){

                        status.value =
                            selectedFilter;

                    }


                    /*
                    Apply filters
                    */

                    filterMeetings();

                }
            );

        });

}


/*==================================================
FILTER MEETINGS
==================================================*/

function filterMeetings(){

    /*
    ==================================================
    GET SEARCH VALUE
    ==================================================
    */

    const keyword =
        (
            document
                .getElementById(
                    "meetingSearch"
                )
                ?.value || ""
        )
        .trim()
        .toLowerCase();


    /*
    ==================================================
    GET PROVIDER
    ==================================================
    */

    const provider =
        (
            document
                .getElementById(
                    "providerFilter"
                )
                ?.value || "all"
        )
        .trim()
        .toLowerCase();


    /*
    ==================================================
    GET STATUS
    ==================================================
    */

    const status =
        (
            document
                .getElementById(
                    "statusFilter"
                )
                ?.value || "all"
        )
        .trim()
        .toLowerCase();


    /*
    ==================================================
    TODAY
    ==================================================
    */

    const now = new Date();


    const today =
        new Date(now);

    today.setHours(
        0,
        0,
        0,
        0
    );


    /*
    ==================================================
    TOMORROW
    ==================================================
    */

    const tomorrow =
        new Date(today);

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    /*
    ==================================================
    DAY AFTER TOMORROW
    ==================================================
    */

    const dayAfterTomorrow =
        new Date(tomorrow);

    dayAfterTomorrow.setDate(
        dayAfterTomorrow.getDate() + 1
    );


    /*
    ==================================================
    GET ALL MEETINGS
    ==================================================
    */

    const meetings =
        getMeetings();


    /*
    ==================================================
    APPLY FILTERS
    ==================================================
    */

    filteredMeetings =
        meetings.filter(
            meeting => {

                /*
                ==========================================
                ALWAYS RECALCULATE STATUS
                ==========================================
                */

                const currentStatus =
                    getCurrentMeetingStatus(
                        meeting
                    )
                    .toLowerCase();


                /*
                ==========================================
                SEARCH DATA
                ==========================================
                */

                const title =
                    String(
                        meeting.title || ""
                    )
                    .toLowerCase();


                const tutor =
                    String(
                        meeting.tutor || ""
                    )
                    .toLowerCase();


                const meetingProvider =
                    String(
                        meeting.provider || ""
                    )
                    .toLowerCase();


                /*
                ==========================================
                MEETING DATE
                ==========================================
                */

                const meetingDate =
                    meeting.date
                        ? new Date(
                            `${meeting.date}T00:00:00`
                        )
                        : null;


                /*
                ==========================================
                SEARCH FILTER
                ==========================================
                */

                const matchesSearch =

                    !keyword ||

                    title.includes(
                        keyword
                    ) ||

                    tutor.includes(
                        keyword
                    ) ||

                    meetingProvider.includes(
                        keyword
                    );


                /*
                ==========================================
                PROVIDER FILTER
                ==========================================
                */

                const matchesProvider =

                    provider === "all" ||

                    !provider ||

                    meetingProvider ===
                        provider;


                /*
                ==========================================
                STATUS FILTER
                ==========================================
                */

                let matchesStatus = true;


                /*
                LIVE
                */

                if(
                    status === "live"
                ){

                    matchesStatus =
                        currentStatus ===
                        "live";

                }


                /*
                COMPLETED
                */

                else if(
                    status === "completed"
                ){

                    matchesStatus =
                        currentStatus ===
                        "completed";

                }


                /*
                UPCOMING
                */

                else if(
                    status === "upcoming"
                ){

                    matchesStatus =
                        currentStatus ===
                        "upcoming";

                }


                /*
                TODAY
                */

                else if(
                    status === "today"
                ){

                    matchesStatus =

                        meetingDate &&

                        meetingDate >=
                            today &&

                        meetingDate <
                            tomorrow;

                }


                /*
                TOMORROW
                */

                else if(
                    status === "tomorrow"
                ){

                    matchesStatus =

                        meetingDate &&

                        meetingDate >=
                            tomorrow &&

                        meetingDate <
                            dayAfterTomorrow;

                }


                /*
                ALL
                */

                else {

                    matchesStatus =
                        true;

                }


                /*
                ==========================================
                FINAL RESULT
                ==========================================
                */

                return (

                    matchesSearch &&

                    matchesProvider &&

                    matchesStatus

                );

            }
        );


    /*
    ==================================================
    DISPLAY RESULTS
    ==================================================
    */

    renderFilteredMeetings();

}

/*==================================================
RENDER FILTERED MEETINGS
==================================================*/

function renderFilteredMeetings(){

    const container =
        document.getElementById(
            "meetingsList"
        );


    /*
    ==================================================
    SAFETY CHECK
    ==================================================
    */

    if(!container){

        console.warn(
            "meetingsList not found."
        );

        return;

    }


    /*
    ==================================================
    EMPTY RESULTS
    ==================================================
    */

    if(
        !filteredMeetings ||
        filteredMeetings.length === 0
    ){

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    <i class="fas fa-calendar-times"></i>
                </div>

                <h3>
                    No meetings found
                </h3>

                <p>
                    No meetings match the
                    selected filters.
                </p>

            </div>

        `;

        return;

    }


    /*
    ==================================================
    RENDER MEETING CARDS
    ==================================================
    */

    container.innerHTML =
        filteredMeetings
            .map(
                meeting =>
                    createMeetingCard(
                        meeting
                    )
            )
            .join("");


    /*
    ==================================================
    UPDATE CARD EVENTS
    ==================================================
    */

    initialiseMeetingCardEvents();

}


/*==================================================
MEETING CARD EVENTS
==================================================*/

function initialiseMeetingCardEvents(){

    /*
    ==================================================
    FIND ALL MEETING CARDS
    ==================================================
    */

    const cards =
        document.querySelectorAll(
            "[data-meeting-id]"
        );


    /*
    ==================================================
    ATTACH CLICK EVENTS
    ==================================================
    */

    cards.forEach(card => {

        card.addEventListener(
            "click",
            event => {

                /*
                ==========================================
                DO NOT TRIGGER FROM BUTTONS/LINKS
                ==========================================
                */

                if(
                    event.target.closest(
                        "button"
                    ) ||
                    event.target.closest(
                        "a"
                    )
                ){

                    return;

                }


                /*
                ==========================================
                GET MEETING ID
                ==========================================
                */

                const meetingId =
                    card.dataset.meetingId;


                if(!meetingId){

                    return;

                }


                /*
                ==========================================
                OPEN MEETING ROOM
                ==========================================
                */

                window.location.href =
                    `meeting-room.html?id=${encodeURIComponent(
                        meetingId
                    )}`;

            }
        );

    });

}


/*==================================================
MEETING ACTIONS
==================================================*/

function openMeeting(meetingId){

    if(!meetingId){

        console.warn(
            "Meeting ID missing."
        );

        return;

    }


    window.location.href =
        `meeting-room.html?id=${encodeURIComponent(
            meetingId
        )}`;

}


/*==================================================
DELETE MEETING
==================================================*/

function deleteMeeting(meetingId){

    if(!meetingId){

        return;

    }


    /*
    ==================================================
    CONFIRMATION
    ==================================================
    */

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this meeting?"
        );


    if(!confirmed){

        return;

    }


    /*
    ==================================================
    GET EXISTING MEETINGS
    ==================================================
    */

    const meetings =
        getMeetings();


    /*
    ==================================================
    REMOVE SELECTED MEETING
    ==================================================
    */

    const updatedMeetings =
        meetings.filter(
            meeting =>
                String(
                    meeting.id
                ) !==
                String(
                    meetingId
                )
        );


    /*
    ==================================================
    SAVE
    ==================================================
    */

    localStorage.setItem(
        "meetings",
        JSON.stringify(
            updatedMeetings
        )
    );


    /*
    ==================================================
    REFRESH PAGE DATA
    ==================================================
    */

    syncSharedMeetings();

    refreshMeetings();

    updateStatistics();


    /*
    ==================================================
    SHOW MESSAGE
    ==================================================
    */

    showMeetingNotification(
        "Meeting deleted successfully.",
        "success"
    );

}


/*==================================================
MEETING NOTIFICATION
==================================================*/

function showMeetingNotification(
    message,
    type = "info"
){

    /*
    ==================================================
    REMOVE EXISTING NOTIFICATION
    ==================================================
    */

    const existing =
        document.querySelector(
            ".meeting-notification"
        );


    if(existing){

        existing.remove();

    }


    /*
    ==================================================
    CREATE NOTIFICATION
    ==================================================
    */

    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        `meeting-notification ${type}`;


    notification.textContent =
        message;


    /*
    ==================================================
    ADD TO PAGE
    ==================================================
    */

    document.body.appendChild(
        notification
    );


    /*
    ==================================================
    AUTO REMOVE
    ==================================================
    */

    setTimeout(
        () => {

            notification.remove();

        },
        3000
    );

}

/*==================================================
MEETING MODAL HELPERS
==================================================*/

function closeMeetingModal(){

    const modal =
        document.querySelector(
            ".meeting-modal"
        );

    if(modal){

        modal.remove();

    }

}


/*==================================================
ESC KEY
==================================================*/

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape"
        ){

            closeMeetingModal();

        }

    }
);


/*==================================================
CLICK OUTSIDE MODAL
==================================================*/

document.addEventListener(
    "click",
    event => {

        const modal =
            event.target.closest(
                ".meeting-modal"
            );


        if(
            modal &&
            event.target === modal
        ){

            closeMeetingModal();

        }

    }
);


/*==================================================
CREATE MEETING BUTTON
==================================================*/

function initialiseCreateMeetingButton(){

    const buttons =
        document.querySelectorAll(
            "#createMeetingBtn, .create-meeting-btn"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                /*
                ==========================================
                USE EXISTING CREATE MEETING FUNCTION
                ==========================================
                */

                if(
                    typeof window.openCreateMeetingModal ===
                    "function"
                ){

                    window.openCreateMeetingModal();

                    return;

                }


                if(
                    typeof window.showCreateMeetingModal ===
                    "function"
                ){

                    window.showCreateMeetingModal();

                    return;

                }


                console.warn(
                    "Create Meeting modal function not found."
                );

            }
        );

    });

}


/*==================================================
REFRESH MEETING DATA
==================================================*/

function refreshMeetingData(){

    /*
    ==================================================
    SYNC SHARED DATA
    ==================================================
    */

    syncSharedMeetings();


    /*
    ==================================================
    REFRESH DISPLAY
    ==================================================
    */

    filterMeetings();


    /*
    ==================================================
    REFRESH STATISTICS
    ==================================================
    */

    updateStatistics();

}


/*==================================================
STORAGE EVENT
==================================================*/

window.addEventListener(
    "storage",
    event => {

        /*
        ==================================================
        ONLY RESPOND TO MEETING STORAGE CHANGES
        ==================================================
        */

        if(
            event.key === "meetings"
        ){

            refreshMeetingData();

        }

    }
);


/*==================================================
PAGE VISIBILITY
==================================================*/

document.addEventListener(
    "visibilitychange",
    () => {

        /*
        ==================================================
        REFRESH WHEN USER RETURNS TO PAGE
        ==================================================
        */

        if(
            document.visibilityState ===
            "visible"
        ){

            refreshMeetingData();

        }

    }
);


/*==================================================
INITIALISE CREATE MEETING BUTTON
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initialiseCreateMeetingButton();

    }
);


/*==================================================
GLOBAL HELPERS
==================================================*/

window.openMeeting =
    openMeeting;

window.deleteMeeting =
    deleteMeeting;

window.refreshMeetings =
    refreshMeetingData;


/*==================================================
END OF MEETINGS.JS
==================================================*/