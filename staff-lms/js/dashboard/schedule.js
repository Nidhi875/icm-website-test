/*==================================================
    GOULDINGS STAFF LMS
    REAL TODAY'S SCHEDULE
==================================================*/

(function () {

    "use strict";


    const STORAGE_KEY =
        "staff-lms-meetings";


    /*==================================================
        DATE KEY
    ==================================================*/

    function getDateKey(date) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;

    }


    /*==================================================
        LOAD MEETINGS
    ==================================================*/

    function getMeetings() {

        try {

            const stored =
                localStorage.getItem(
                    STORAGE_KEY
                );


            const meetings =
                JSON.parse(
                    stored || "[]"
                );


            return Array.isArray(meetings)
                ? meetings
                : [];

        }

        catch (error) {

            console.error(
                "Unable to load dashboard meetings:",
                error
            );

            return [];

        }

    }


    /*==================================================
        MEETING DATETIME
    ==================================================*/

    function getStartDateTime(meeting) {

        if (
            !meeting.date ||
            !meeting.time
        ) {

            return null;

        }


        const date =
            new Date(
                `${meeting.date}T${meeting.time}:00`
            );


        return isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    /*==================================================
        STATUS
    ==================================================*/

    function getStatus(meeting) {

        const start =
            getStartDateTime(
                meeting
            );


        if (!start) {

            return "UPCOMING";

        }


        const duration =
            Number(
                meeting.duration
            ) || 60;


        const end =
            new Date(
                start.getTime() +
                duration * 60000
            );


        const now =
            new Date();


        if (
            now < start
        ) {

            return "UPCOMING";

        }


        if (
            now >= start &&
            now < end
        ) {

            return "LIVE";

        }


        return "COMPLETED";

    }


    /*==================================================
        FORMAT TIME
    ==================================================*/

    function formatTime(time) {

        if (!time) {

            return "";

        }


        const parts =
            String(
                time
            ).split(":");


        const hour =
            Number(
                parts[0]
            );


        const minute =
            parts[1] ||
            "00";


        if (
            Number.isNaN(
                hour
            )
        ) {

            return time;

        }


        const suffix =
            hour >= 12
                ? "PM"
                : "AM";


        const displayHour =
            hour % 12 ||
            12;


        return `${String(displayHour).padStart(2, "0")}:${minute} ${suffix}`;

    }


    /*==================================================
        FORMAT DATE
    ==================================================*/

    function formatDate(date) {

        return date.toLocaleDateString(
            "en-GB",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    }


    /*==================================================
        RENDER SCHEDULE
    ==================================================*/

    function renderDashboardSchedule(
        selectedDate = new Date()
    ) {

        const container =
            document.getElementById(
                "scheduleList"
            );


        if (!container) {

            return;

        }


        const dateElement =
            document.getElementById(
                "scheduleDate"
            );


        if (dateElement) {

            dateElement.textContent =
                formatDate(
                    selectedDate
                );

        }


        /*
        ==============================================
        LOAD
        ==============================================
        */

        let meetings =
            getMeetings();


        const selectedKey =
            getDateKey(
                selectedDate
            );


        /*
        ==============================================
        FILTER DATE
        ==============================================
        */

        meetings =
            meetings.filter(
                meeting =>
                    meeting.date ===
                    selectedKey
            );


        /*
        ==============================================
        SORT TIME
        ==============================================
        */

        meetings.sort(
            (a, b) => {

                const dateA =
                    getStartDateTime(
                        a
                    );


                const dateB =
                    getStartDateTime(
                        b
                    );


                return (
                    (dateA?.getTime() || 0) -
                    (dateB?.getTime() || 0)
                );

            }
        );


        /*
        ==============================================
        EMPTY STATE
        ==============================================
        */

        if (
            meetings.length ===
            0
        ) {

            container.innerHTML = `

                <div class="schedule-empty">

                    <div class="schedule-empty-icon">
                        <i class="fa-regular fa-calendar"></i>
                    </div>

                    <div>

                        <h4>
                            No meetings scheduled
                        </h4>

                        <p>
                            There are no meetings
                            on this date.
                        </p>

                    </div>

                </div>

            `;

            return;

        }


        /*
        ==============================================
        RENDER
        ==============================================
        */

        container.innerHTML =
            meetings
                .map(
                    meeting => {

                        const status =
                            getStatus(
                                meeting
                            );


                        const statusClass =
                            status
                                .toLowerCase();


                        const title =
                            meeting.title ||
                            "Untitled Meeting";


                        const tutor =
                            meeting.tutor ||
                            "Staff Member";


                        const platform =
                            meeting.platform ||
                            "Google Meet";


                        const attendees =
                            Number(
                                meeting.attendees
                            ) || 0;


                        let secondary =
                            tutor;


                        if (
                            attendees > 0
                        ) {

                            secondary +=
                                ` • ${attendees} Participants`;

                        }


                        return `

                            <div
                                class="schedule-item"
                                data-meeting-id="${meeting.id || ""}"
                            >

                                <div class="schedule-time">

                                    ${formatTime(
                                        meeting.time
                                    )}

                                </div>


                                <div class="schedule-info">

                                    <h4>
                                        ${title}
                                    </h4>

                                    <p>
                                        ${secondary}
                                    </p>

                                </div>


                                <span
                                    class="status ${statusClass}"
                                >
                                    ${status === "LIVE"
                                        ? "Live"
                                        : status === "COMPLETED"
                                            ? "Completed"
                                            : "Upcoming"
                                    }
                                </span>


                            </div>

                        `;

                    }
                )
                .join("");


        /*
        ==============================================
        CLICK SCHEDULE ITEM
        ==============================================
        */

        container
            .querySelectorAll(
                ".schedule-item[data-meeting-id]"
            )
            .forEach(
                item => {

                    item.addEventListener(
                        "click",
                        function () {

                            const id =
                                item.dataset.meetingId;


                            if (!id) {

                                return;

                            }


                            window.location.href =
                                `meeting-room.html?id=${encodeURIComponent(
                                    id
                                )}`;

                        }
                    );

                }
            );

    }


    /*==================================================
        INITIALISE
    ==================================================*/

    function initScheduleWidget() {

        /*
        The component is loaded asynchronously
        by app.js, so wait until scheduleList exists.
        */

        if (
            document.getElementById(
                "scheduleList"
            )
        ) {

            renderDashboardSchedule();

            return;

        }


        /*
        Retry while the component
        is being injected.
        */

        let attempts =
            0;


        const timer =
            setInterval(
                function () {

                    attempts++;


                    if (
                        document.getElementById(
                            "scheduleList"
                        )
                    ) {

                        clearInterval(
                            timer
                        );


                        renderDashboardSchedule();

                    }


                    if (
                        attempts >=
                        50
                    ) {

                        clearInterval(
                            timer
                        );

                    }

                },
                100
            );

    }


    /*==================================================
        STORAGE REFRESH
    ==================================================*/

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                STORAGE_KEY
            ) {

                renderDashboardSchedule();

            }

        }
    );


    /*==================================================
        SAME TAB REFRESH
    ==================================================*/

    window.refreshDashboardSchedule =
        function () {

            renderDashboardSchedule();

        };


    /*
    Expose functions.
    */

    window.renderDashboardSchedule =
        renderDashboardSchedule;


    window.initScheduleWidget =
        initScheduleWidget;


    /*
    Start.
    */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            initScheduleWidget();

        }
    );


})();