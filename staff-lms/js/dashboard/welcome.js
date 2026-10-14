
(function () {
    "use strict";

    const MEETING_KEY = "staff-lms-meetings";
    let refreshTimer = null;
    let listenersInitialised = false;

    function getLocalMeetings() {
        try {
            const stored = localStorage.getItem(MEETING_KEY);
            const meetings = JSON.parse(stored || "[]");

            return Array.isArray(meetings) ? meetings : [];
        } catch (error) {
            console.error("WELCOME MEETINGS ERROR:", error);
            return [];
        }
    }

    function getTodayKey() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function updateMeetingsToday() {
        const countElement = document.getElementById(
            "welcomeMeetingsToday"
        );

        if (!countElement) return;

        const today = getTodayKey();
        const meetings = getLocalMeetings();

        const count = meetings.filter(function (meeting) {
            return meeting && meeting.date === today;
        }).length;

        countElement.textContent = count;
    }

    function initWelcomeBanner() {
        updateMeetingsToday();

        if (listenersInitialised) return;
        listenersInitialised = true;

        window.addEventListener(
            "staff-lms-meetings-changed",
            updateMeetingsToday
        );

        window.addEventListener("storage", function (event) {
            if (event.key === MEETING_KEY) {
                updateMeetingsToday();
            }
        });

        if (refreshTimer) {
            clearInterval(refreshTimer);
        }

        refreshTimer = window.setInterval(
            updateMeetingsToday,
            60000
        );

        console.log("WELCOME BANNER INITIALISED");
    }

    // Expose the function so app.js can call it.
    window.initWelcomeBanner = initWelcomeBanner;

    // Also initialise safely if the banner is already present.
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initWelcomeBanner
        );
    } else {
        initWelcomeBanner();
    }
})();
