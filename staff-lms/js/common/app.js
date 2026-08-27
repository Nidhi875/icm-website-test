if (localStorage.getItem("staffLoggedIn") !== "true") {
    window.location.href = "login.html";
}

/*==========================================
COMPONENT LOADER
==========================================*/

/*==========================================
COMPONENT LOADER
==========================================*/

async function loadComponent(url, selector) {

    console.log("Loading:", url);

    const element = document.querySelector(selector);

    if (!element) {
        console.log("Missing selector:", selector);
        return;
    }

    try {

        const response = await fetch(url);

        console.log(url, response.status);

        const html = await response.text();

        element.innerHTML = html;

    } catch(err) {

        console.error(err);

    }

}
/*==========================================
LOAD ALL COMPONENTS
==========================================*/

async function loadLayout() {

    await Promise.all([

        loadComponent("layouts/sidebar.html", "#sidebar"),
        loadComponent("layouts/header.html", "#header"),
        loadComponent("components/welcome-banner.html", "#welcomeBanner"),
        loadComponent("components/schedule-widget.html", "#scheduleWidget"),
        loadComponent("components/calendar-widget.html", "#calendarWidget")
    ]);

    initHeaderActions();

    initHeaderLiveCounts();

    /* ==========================
       MOBILE SIDEBAR TOGGLE
       (must run after header/sidebar are loaded,
       since #mobileMenuBtn only exists once
       layouts/header.html has finished injecting)
    ========================== */
    const sidebar   = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('mobileMenuBtn');
    const backdrop  = document.getElementById('sidebarBackdrop');

    if (sidebar && toggleBtn && backdrop) {

        function openSidebar(){
            sidebar.classList.add('open');
            backdrop.classList.add('visible');
        }

        function closeSidebar(){
            sidebar.classList.remove('open');
            backdrop.classList.remove('visible');
        }

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
        });

        backdrop.addEventListener('click', closeSidebar);

        document.addEventListener('click', (e) => {
            if (e.target.closest('.sidebar-menu a')) closeSidebar();
        });

    } else {
        console.warn("Mobile sidebar toggle: missing element(s)", { sidebar, toggleBtn, backdrop });
    }


        /* ==========================
       WELCOME BANNER ACTIONS
    ========================== */
    const viewCalendarBtn   = document.getElementById('viewCalendarBtn');
    const scheduleMeetingBtn = document.getElementById('scheduleMeetingBtn');

    if (viewCalendarBtn) {
        viewCalendarBtn.addEventListener('click', () => {
            const calendarSection = document.getElementById('calendarWidget');
            if (calendarSection) {
                calendarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    if (scheduleMeetingBtn) {
        scheduleMeetingBtn.addEventListener('click', () => {
            window.location.href = 'meetings.html';
        });
    }


    if (document.querySelector("#meetingsWidget")) {
        loadComponent(
            "components/meeting-widget.html",
            "#meetingsWidget"
        );
    }


    if (typeof initCalendarWidget === "function") {
        initCalendarWidget();
    }


    if (typeof renderMeetings === "function") {
        renderMeetings();
    }


    /* Render Lucide Icons */
    if (window.lucide) {
        lucide.createIcons();
    }

    /* Highlight Active Menu */
    setActiveLink();


    if (typeof initProfilePhotoUpload === "function") {
        initProfilePhotoUpload();
    }


    /* Load Logged-in Staff */
    loadStaffInfo();

    /* Load Staff Presence */
    loadStaffPresence();


    initLogout();

}


/* ==========================================================
   HEADER ACTIONS
   Safe - only affects header buttons that exist
========================================================== */

function initHeaderActions() {

    /* ---------------------------
       CALENDAR
    --------------------------- */

    const calendarButtons =
        document.querySelectorAll(".header .action-btn");

    if (calendarButtons.length > 0) {

        /*
         * First action button = Calendar
         */
        const calendarButton = calendarButtons[0];

        if (
            calendarButton &&
            !calendarButton.dataset.headerActionBound
        ) {

            calendarButton.dataset.headerActionBound = "true";

            calendarButton.addEventListener("click", () => {

                /*
                 * If a calendar widget exists on the current page,
                 * scroll to it.
                 */
                const calendarWidget =
                    document.getElementById("calendarWidget");

                if (calendarWidget) {

                    calendarWidget.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                    return;
                }

                /*
                 * Otherwise open Meetings page.
                 */
                window.location.href = "meetings.html";

            });

        }
    }


    /* ---------------------------
       DARK MODE / MOON
    --------------------------- */

    if (!document.getElementById("headerDarkModeStyle")) {

        const style =
            document.createElement("style");

        style.id = "headerDarkModeStyle";

        style.textContent = `
            body.header-dark-mode {
                background: #101827 !important;
                color: #f5f7fa !important;
            }

            body.header-dark-mode .main-content,
            body.header-dark-mode .page-wrapper {
                background: #101827 !important;
            }

            body.header-dark-mode .header {
                background: #071b38 !important;
            }

            body.header-dark-mode .card,
            body.header-dark-mode .kpi-card,
            body.header-dark-mode .activity-card,
            body.header-dark-mode .messages-card {
                background: #182438 !important;
            }
        `;

        document.head.appendChild(style);
    }


    const moonButton =
        document.querySelector(
            '.header .action-btn [data-lucide="moon"]'
        )?.closest(".action-btn");


    if (
        moonButton &&
        !moonButton.dataset.headerActionBound
    ) {

        moonButton.dataset.headerActionBound = "true";

        /*
         * Restore saved preference
         */
        if (
            localStorage.getItem(
                "staffDarkMode"
            ) === "true"
        ) {

            document.body.classList.add(
                "header-dark-mode"
            );

        }


        moonButton.addEventListener("click", () => {

            const enabled =
                document.body.classList.toggle(
                    "header-dark-mode"
                );

            localStorage.setItem(
                "staffDarkMode",
                enabled ? "true" : "false"
            );

            console.log(
                "Dark mode:",
                enabled ? "ON" : "OFF"
            );

        });

    }


    /* ---------------------------
       PROFILE
    --------------------------- */

    const profile =
        document.querySelector(".header-profile");

    if (
        profile &&
        !profile.dataset.headerActionBound
    ) {

        profile.dataset.headerActionBound = "true";

        profile.style.cursor = "pointer";

        profile.addEventListener("click", () => {

            /*
             * Only navigate if profile.html exists
             * or if your project already uses that page.
             *
             * Change this to your actual profile page
             * if it has a different filename.
             */
            window.location.href = "profile.html";

        });

    }

}


/* ==========================================================
   HEADER LIVE COUNTS
   SAFE ADD-ON
   Does NOT modify existing page functionality
========================================================== */

function initHeaderLiveCounts() {

    console.log("Header live counts initialized");


    /* ======================================================
       SAFE BADGE UPDATE
    ====================================================== */

    function updateBadge(id, count) {

        const badge =
            document.getElementById(id);

        if (!badge) {
            return;
        }

        const number =
            Number(count);

        if (
            !Number.isFinite(number) ||
            number <= 0
        ) {

            badge.textContent = "";
            badge.classList.add("hidden");

            return;
        }

        badge.textContent =
            number > 99 ? "99+" : String(number);

        badge.classList.remove("hidden");
    }


    /* ======================================================
       MESSAGE COUNT
    ====================================================== */

    async function updateMessageCount() {

        try {

            const response =
                await fetch(
                    "https://icm-website-test-production.up.railway.app/api/messages",
                    {
                        cache: "no-store"
                    }
                );

            if (!response.ok) {
                return;
            }

            const data =
                await response.json();

            if (!data.success) {
                return;
            }

            const messages =
                Array.isArray(data.messages)
                    ? data.messages
                    : [];


            /*
             * Only unread messages.
             *
             * This uses the same is_read field
             * already used by your messages system.
             */

            const unread =
                messages.filter(
                    message =>
                        message &&
                        (
                            message.is_read === false ||
                            message.is_read === 0 ||
                            message.is_read === "false"
                        )
                ).length;


            updateBadge(
                "messageCount",
                unread
            );


            console.log(
                "HEADER UNREAD MESSAGES:",
                unread
            );

        } catch (error) {

            /*
             * Do NOT destroy the badge or
             * interfere with the rest of the page.
             */

            console.warn(
                "Header message count unavailable:",
                error
            );

        }

    }


    /* ======================================================
       NOTIFICATION COUNT
    ====================================================== */

    async function updateNotificationCount() {

        try {

            const response =
                await fetch(
                    "https://icm-website-test-production.up.railway.app/api/notifications",
                    {
                        cache: "no-store"
                    }
                );

            if (!response.ok) {
                return;
            }

            const data =
                await response.json();

            const notifications =
                Array.isArray(data.notifications)
                    ? data.notifications
                    : [];


            updateBadge(
                "notificationCount",
                notifications.length
            );


            console.log(
                "HEADER NOTIFICATIONS:",
                notifications.length
            );

        } catch (error) {

            console.warn(
                "Header notification count unavailable:",
                error
            );

        }

    }


    /* ======================================================
       CALENDAR / UPCOMING MEETINGS
    ====================================================== */

  function updateCalendarCount() {

    try {

        const meetings = JSON.parse(
            localStorage.getItem("staff-lms-meetings") || "[]"
        );

        if (!Array.isArray(meetings)) {
            updateBadge("calendarCount", 0);
            return;
        }

        const today = new Date();

        const todayString =
            today.getFullYear() +
            "-" +
            String(today.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(today.getDate()).padStart(2, "0");

        const todayMeetings = meetings.filter(meeting => {

            if (!meeting || !meeting.date) {
                return false;
            }

            return String(meeting.date) === todayString;

        });

        updateBadge(
            "calendarCount",
            todayMeetings.length
        );

        console.log(
            "TODAY'S MEETING COUNT:",
            todayMeetings.length
        );

    } catch (error) {

        console.warn(
            "Header calendar count unavailable:",
            error
        );

        updateBadge(
            "calendarCount",
            0
        );
    }
}


    /* ======================================================
       REFRESH ALL COUNTS
    ====================================================== */

    async function refreshHeaderCounts() {

        updateCalendarCount();

        await Promise.allSettled([
            updateMessageCount(),
            updateNotificationCount()
        ]);

    }


    /* ======================================================
       FIRST LOAD
    ====================================================== */

    refreshHeaderCounts();


    /* ======================================================
       AUTOMATIC REFRESH
       Every 30 seconds
    ====================================================== */

    if (
        window.gouldingsHeaderCountTimer
    ) {

        clearInterval(
            window.gouldingsHeaderCountTimer
        );

    }


    window.gouldingsHeaderCountTimer =
        setInterval(
            refreshHeaderCounts,
            30000
        );


    /* ======================================================
       CALENDAR BUTTON
       Only if the button exists
    ====================================================== */

    const calendarButton =
        document.getElementById(
            "calendarHeaderBtn"
        );


    if (
        calendarButton &&
        !calendarButton.dataset.liveCountBound
    ) {

        calendarButton.dataset.liveCountBound =
            "true";


        calendarButton.addEventListener(
            "click",
            () => {

                const calendarWidget =
                    document.getElementById(
                        "calendarWidget"
                    );


                if (calendarWidget) {

                    calendarWidget.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                } else {

                    window.location.href =
                        "meetings.html";

                }

            }
        );

    }


    /* ======================================================
       REFRESH CALENDAR WHEN ANOTHER TAB CHANGES MEETINGS
    ====================================================== */

    if (
        !window.gouldingsCalendarStorageListener
    ) {

        window.gouldingsCalendarStorageListener =
            true;


        window.addEventListener(
            "storage",
            event => {

                if (
                    event.key ===
                    "staff-lms-meetings"
                ) {

                    updateCalendarCount();

                }

            }
        );

    }

}


/*==========================================
ACTIVE SIDEBAR LINK
==========================================*/

function setActiveLink() {

    const currentPage = window.location.pathname.split("/").pop();

    document.querySelectorAll(".sidebar-link").forEach(link => {

        const href = link.getAttribute("href");

        if (href === currentPage) {

            link.classList.add("active");

        } else {

            link.classList.remove("active");

        }

    });

}



/*==========================================
INITIALIZE
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadLayout();


    // Restore page scrolling
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

});

/*==========================================
LOAD STAFF INFORMATION
==========================================*/

function loadStaffInfo() {

    // Temporary values
    // Later these will come from the login system

    const staff = {

        name: localStorage.getItem("staffName") || "Staff Member",

        role: localStorage.getItem("staffRole") || "Administrator"

    };

    // Welcome Banner

    const welcomeName = document.getElementById("welcomeName");

    if (welcomeName) {

        welcomeName.textContent = staff.name;

    }

    // Header

    const headerName = document.getElementById("headerStaffName");

    const headerRole = document.getElementById("headerStaffRole");

    if (headerName) headerName.textContent = staff.name;

    if (headerRole) headerRole.textContent = staff.role;

    // Sidebar

    const sidebarName = document.getElementById("sidebarStaffName");

    const sidebarRole = document.getElementById("sidebarStaffRole");

    if (sidebarName) sidebarName.textContent = staff.name;

    if (sidebarRole) sidebarRole.textContent = staff.role;

}



/*==========================================
MEETING STATUS ENGINE
==========================================*/

function getMeetingStatus(meeting){

    const now = new Date();

    const meetingStart = new Date(`${meeting.date}T${meeting.time}:00`);

    const meetingEnd = new Date(
        meetingStart.getTime() + meeting.duration * 60000
    );

    const diffMinutes = Math.floor(
        (meetingStart.getTime() - now.getTime()) / 60000
    );

    const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // LIVE
    if(now >= meetingStart && now <= meetingEnd){

        return{
            text:"LIVE",
            class:"live"
        };

    }

    // Starts within 60 minutes
    if(diffMinutes > 0 && diffMinutes <= 60){

        return{
            text:`Starts in ${diffMinutes} min`,
            class:"upcoming"
        };

    }

    // Today (later than 60 min)
    if(meetingStart.toDateString() === today.toDateString()){

        return{
            text:"Today",
            class:"upcoming"
        };

    }

    // Tomorrow
    if(meetingStart.toDateString() === tomorrow.toDateString()){

        return{
            text:"Tomorrow",
            class:"upcoming"
        };

    }

    // Completed
    if(now > meetingEnd){

        return{
            text:"Completed",
            class:"completed"
        };

    }

    // Future
    return{

        text:"Upcoming",
        class:"upcoming"

    };

}

/*==========================================
MEETING DATE FORMATTER
==========================================*/

function formatMeetingDate(meeting){

    const today = new Date();

    const meetingDate = new Date(meeting.date);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate()-1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate()+1);

    if(meetingDate.toDateString()===today.toDateString()){

        return "Today";

    }

    if(meetingDate.toDateString()===tomorrow.toDateString()){

        return "Tomorrow";

    }

    if(meetingDate.toDateString()===yesterday.toDateString()){

        return "Yesterday";

    }

    return meetingDate.toLocaleDateString("en-GB",{

        day:"2-digit",

        month:"short",

        year:"numeric"

    });

}


/*==========================================
LOGOUT
==========================================*/

function initLogout() {

    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", function (e) {

        e.preventDefault();

        if (!confirm("Are you sure you want to logout?")) {
            return;
        }

        // Remove login session
        localStorage.removeItem("staffLoggedIn");
        localStorage.removeItem("staffName");
        localStorage.removeItem("staffEmail");
        localStorage.removeItem("staffRole");
        localStorage.removeItem("staffId");

        // Redirect to login page
        window.location.href = "login.html";

    });

}

/*==========================================
STAFF PRESENCE HEARTBEAT
==========================================*/

async function updateStaffPresence() {

    const staffId = localStorage.getItem("staffId");

    // No logged-in staff
    if (!staffId) {
        return;
    }

    try {

        const response = await fetch(
            "https://icm-website-test-production.up.railway.app/api/staff/presence/heartbeat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    staffId: Number(staffId)
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Presence request failed: ${response.status}`);
        }

        console.log("Staff presence updated:", staffId);

    } catch (error) {

        console.error("Staff presence heartbeat failed:", error);

    }
}


/*==========================================
START PRESENCE HEARTBEAT
==========================================*/

// Update immediately when page loads
updateStaffPresence();

// Update every 60 seconds
setInterval(updateStaffPresence, 30000);

/*==========================================
STAFF PRESENCE
==========================================*/

async function loadStaffPresence() {

    const onlineElement = document.getElementById("teamOnlineCount");
    const memberElement = document.getElementById("teamMemberCount");

    if (!onlineElement) return;

    try {

        const response = await fetch(
            "https://icm-website-test-production.up.railway.app/api/staff/presence"
        );

        if (!response.ok) {
            throw new Error(`Presence request failed: ${response.status}`);
        }

        const data = await response.json();

        console.log("STAFF PRESENCE RESPONSE:", data);

        if (data.success) {

            onlineElement.textContent =
                `${data.online} Currently Online`;

        } else {

            onlineElement.textContent = "Unable to check";

        }

    } catch (error) {

        console.error("Failed to load staff presence:", error);

        onlineElement.textContent = "Unable to check";

    }
}