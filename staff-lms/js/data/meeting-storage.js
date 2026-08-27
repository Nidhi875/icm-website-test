/*==========================================
    MEETING STORAGE
==========================================*/

const MEETING_KEY = "staff-lms-meetings";


/*==========================================
    READ MEETINGS
==========================================*/

function getMeetings() {

    try {

        const data = localStorage.getItem(MEETING_KEY);

        if (!data) {
            return [];
        }

        const meetings = JSON.parse(data);

        return Array.isArray(meetings) ? meetings : [];

    } catch (error) {

        console.error("GET MEETINGS ERROR:", error);

        return [];
    }
}


/*==========================================
    SAVE MEETINGS
==========================================*/

function saveMeetings(data) {

    try {

        if (!Array.isArray(data)) {
            console.error("saveMeetings expected an array.");
            return;
        }

        localStorage.setItem(
            MEETING_KEY,
            JSON.stringify(data)
        );

        console.log(
            "MEETINGS SAVED:",
            data
        );

    } catch (error) {

        console.error(
            "SAVE MEETINGS ERROR:",
            error
        );
    }
}


/*==========================================
    INITIALISE MEETING STORAGE
==========================================*/

function initialiseMeetingStorage() {

    const existing = localStorage.getItem(MEETING_KEY);

    if (existing) {
        return;
    }

    /*
        Import the old storage if it exists.
        This prevents existing meetings from being lost.
    */

    const oldStorage =
        localStorage.getItem("gouldings_meetings");

    if (oldStorage) {

        try {

            const oldMeetings = JSON.parse(oldStorage);

            if (Array.isArray(oldMeetings)) {

                localStorage.setItem(
                    MEETING_KEY,
                    JSON.stringify(oldMeetings)
                );

                console.log(
                    "OLD MEETING STORAGE MIGRATED:",
                    oldMeetings
                );

                return;
            }

        } catch (error) {

            console.error(
                "OLD MEETING STORAGE MIGRATION ERROR:",
                error
            );
        }
    }


    /*
        First installation:
        use meetingsData from meeting-data.js
    */

    if (
        typeof meetingsData !== "undefined" &&
        Array.isArray(meetingsData)
    ) {

        localStorage.setItem(
            MEETING_KEY,
            JSON.stringify(meetingsData)
        );

        console.log(
            "DEFAULT MEETINGS INITIALISED:",
            meetingsData
        );

    } else {

        localStorage.setItem(
            MEETING_KEY,
            JSON.stringify([])
        );

        console.log(
            "MEETING STORAGE INITIALISED EMPTY"
        );
    }
}


/*==========================================
    KEEP OLD STORAGE IN SYNC
==========================================*/

function syncMeetingStorage() {

    const meetings = getMeetings();

    /*
        Keep the previous key synchronized temporarily.
        This protects Messages/other LMS pages that may
        still be using the old key.
    */

    localStorage.setItem(
        "gouldings_meetings",
        JSON.stringify(meetings)
    );

    localStorage.setItem(
        "staff-lms-meetings",
        JSON.stringify(meetings)
    );

    console.log(
        "MEETING STORAGE SYNCED:",
        meetings
    );
}


/*==========================================
    INITIALISE
==========================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initialiseMeetingStorage();

        syncMeetingStorage();

    }
);