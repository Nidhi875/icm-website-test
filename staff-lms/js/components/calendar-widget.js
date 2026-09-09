/*==================================================
    GOULDINGS STAFF LMS
    REAL DASHBOARD CALENDAR
==================================================*/

(function () {

    "use strict";


    /*==================================================
        STATE
    ==================================================*/

    let currentDate = new Date();

    let selectedDate = new Date();


    const MEETING_STORAGE_KEY =
        "staff-lms-meetings";


    /*==================================================
        DATE HELPERS
    ==================================================*/

    function formatDateKey(date) {

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


    function getMeetings() {

        try {

            const stored =
                localStorage.getItem(
                    MEETING_STORAGE_KEY
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
                "Unable to load meetings:",
                error
            );

            return [];

        }

    }


    function getMeetingDateTime(meeting) {

        if (
            !meeting ||
            !meeting.date ||
            !meeting.time
        ) {

            return null;

        }


        const date =
            new Date(
                `${meeting.date}T${meeting.time}:00`
            );


        return isNaN(date.getTime())
            ? null
            : date;

    }


    function getMeetingStatus(meeting) {

        const start =
            getMeetingDateTime(
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
        CALENDAR
    ==================================================*/

    function renderCalendar() {

        const grid =
            document.getElementById(
                "calendarGrid"
            );


        if (!grid) {

            return;

        }


        const monthSelect =
            document.getElementById(
                "monthSelect"
            );


        const yearSelect =
            document.getElementById(
                "yearSelect"
            );


        const year =
            currentDate.getFullYear();


        const month =
            currentDate.getMonth();


        /*
        ==============================================
        UPDATE SELECTORS
        ==============================================
        */

        if (monthSelect) {

            monthSelect.value =
                String(month);

        }


        if (yearSelect) {

            yearSelect.value =
                String(year);

        }


        /*
        ==============================================
        CLEAR CALENDAR
        ==============================================
        */

        grid.innerHTML = "";


        /*
        ==============================================
        FIRST DAY / LAST DAY
        ==============================================
        */

        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();


        const lastDate =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        /*
        ==============================================
        MEETINGS
        ==============================================
        */

        const meetings =
            getMeetings();


        /*
        ==============================================
        PREVIOUS MONTH EMPTY CELLS
        ==============================================
        */

        for (
            let i = 0;
            i < firstDay;
            i++
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "day inactive";


            grid.appendChild(
                empty
            );

        }


        /*
        ==============================================
        DAYS
        ==============================================
        */

        for (
            let day = 1;
            day <= lastDate;
            day++
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day
                );


            const dateKey =
                formatDateKey(
                    date
                );


            const today =
                formatDateKey(
                    new Date()
                ) ===
                dateKey;


            const selected =
                formatDateKey(
                    selectedDate
                ) ===
                dateKey;


            const dayMeetings =
                meetings.filter(
                    meeting =>
                        meeting.date ===
                        dateKey
                );


            const dayElement =
                document.createElement(
                    "div"
                );


            dayElement.className =
                "day" +
                (
                    today
                        ? " today"
                        : ""
                ) +
                (
                    selected
                        ? " selected"
                        : ""
                ) +
                (
                    dayMeetings.length
                        ? " has-event"
                        : ""
                );


            /*
            ==========================================
            DAY NUMBER
            ==========================================
            */

            const number =
                document.createElement(
                    "div"
                );


            number.className =
                "date";


            number.textContent =
                day;


            dayElement.appendChild(
                number
            );


            /*
            ==========================================
            EVENT DOT
            ==========================================
            */

            if (
                dayMeetings.length
            ) {

                const dot =
                    document.createElement(
                        "span"
                    );


                dot.className =
                    "event-dot";


                dayElement.appendChild(
                    dot
                );

            }


            /*
            ==========================================
            CLICK DATE
            ==========================================
            */

            dayElement.addEventListener(
                "click",
                function () {

                    selectedDate =
                        new Date(
                            year,
                            month,
                            day
                        );


                    renderCalendar();


                    /*
                    If a schedule renderer exists,
                    show the selected date there.
                    */

                    if (
                        typeof window.renderDashboardSchedule ===
                        "function"
                    ) {

                        window.renderDashboardSchedule(
                            selectedDate
                        );

                    }

                }
            );


            grid.appendChild(
                dayElement
            );

        }

    }


    /*==================================================
        POPULATE YEAR DROPDOWN
    ==================================================*/

    function populateYears() {

        const yearSelect =
            document.getElementById(
                "yearSelect"
            );


        if (!yearSelect) {

            return;

        }


        yearSelect.innerHTML =
            "";


        const currentYear =
            new Date().getFullYear();


        /*
        Give a useful range around
        the current year.
        */

        for (
            let year =
                currentYear - 5;

            year <=
                currentYear + 10;

            year++
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(year);


            option.textContent =
                year;


            yearSelect.appendChild(
                option
            );

        }


        yearSelect.value =
            String(
                currentDate.getFullYear()
            );

    }


    /*==================================================
        BUTTONS
    ==================================================*/

    function initialiseCalendarControls() {

        const previous =
            document.getElementById(
                "prevMonth"
            );


        const next =
            document.getElementById(
                "nextMonth"
            );


        const today =
            document.getElementById(
                "todayBtn"
            );


        const month =
            document.getElementById(
                "monthSelect"
            );


        const year =
            document.getElementById(
                "yearSelect"
            );


        /*
        ==============================================
        PREVIOUS MONTH
        ==============================================
        */

        if (previous) {

            previous.onclick =
                function () {

                    currentDate.setMonth(
                        currentDate.getMonth() -
                        1
                    );


                    renderCalendar();

                };

        }


        /*
        ==============================================
        NEXT MONTH
        ==============================================
        */

        if (next) {

            next.onclick =
                function () {

                    currentDate.setMonth(
                        currentDate.getMonth() +
                        1
                    );


                    renderCalendar();

                };

        }


        /*
        ==============================================
        TODAY
        ==============================================
        */

        if (today) {

            today.onclick =
                function () {

                    currentDate =
                        new Date();


                    selectedDate =
                        new Date();


                    renderCalendar();


                    if (
                        typeof window.renderDashboardSchedule ===
                        "function"
                    ) {

                        window.renderDashboardSchedule(
                            new Date()
                        );

                    }

                };

        }


        /*
        ==============================================
        MONTH DROPDOWN
        ==============================================
        */

        if (month) {

            month.onchange =
                function () {

                    currentDate.setMonth(
                        Number(
                            month.value
                        )
                    );


                    renderCalendar();

                };

        }


        /*
        ==============================================
        YEAR DROPDOWN
        ==============================================
        */

        if (year) {

            year.onchange =
                function () {

                    currentDate.setFullYear(
                        Number(
                            year.value
                        )
                    );


                    renderCalendar();

                };

        }

    }


    /*==================================================
        INITIALISE
    ==================================================*/

    function initCalendarWidget() {

        /*
        Make sure component HTML has
        already been injected.
        */

        if (
            !document.getElementById(
                "calendarGrid"
            )
        ) {

            console.warn(
                "Calendar component not loaded yet."
            );

            return;

        }


        populateYears();


        initialiseCalendarControls();


        renderCalendar();

    }


    /*==================================================
        STORAGE CHANGES
    ==================================================*/

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                MEETING_STORAGE_KEY
            ) {

                renderCalendar();

            }

        }
    );


    /*==================================================
        SAME-TAB REFRESH
    ==================================================*/

    window.refreshDashboardCalendar =
        function () {

            renderCalendar();

        };


    /*
    Expose initializer because
    app.js calls this function.
    */

    window.initCalendarWidget =
        initCalendarWidget;


})();