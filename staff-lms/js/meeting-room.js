/*==========================================
LOAD MEETING
==========================================*/

/*==========================================
  LOAD MEETING
==========================================*/

const params = new URLSearchParams(
    window.location.search
);

const meetingId = params.get("id");

console.log("MEETING ROOM ID:", meetingId);


/*
   Read the SAME meeting storage used by
   Messages → Schedule Meeting.
*/
let meetings = [];

try {

    meetings = JSON.parse(
        localStorage.getItem("staff-lms-meetings") || "[]"
    );

    if (!Array.isArray(meetings)) {
        meetings = [];
    }

} catch (error) {

    console.error(
        "Unable to load meetings:",
        error
    );

    meetings = [];
}


console.log(
    "MEETINGS AVAILABLE IN ROOM:",
    meetings
);


/*
   Find the selected meeting.
*/
/*==========================================
    FIND SELECTED MEETING
==========================================*/

let meeting = meetings.find(
    m => String(m.id).trim() === String(meetingId).trim()
);



/*
    Fallback: use the application's normal
    meeting storage function if available.
*/
if (!meeting && typeof getMeetings === "function") {

    try {

        const storedMeetings = getMeetings();

        if (Array.isArray(storedMeetings)) {

            meeting = storedMeetings.find(
                m => String(m.id) === String(meetingId)
            );

        }

    } catch (error) {

        console.error(
            "GET MEETINGS FALLBACK ERROR:",
            error
        );

    }
}


/*==========================================
    MEETING NOT FOUND
==========================================*/

if (!meeting) {

    console.error(
        "MEETING NOT FOUND:",
        meetingId
    );

    console.error(
        "MEETINGS AVAILABLE:",
        meetings
    );

    alert(
        "Meeting not found. Please return to the Meetings page and try again."
    );

    window.location.href =
        "meetings.html";

    throw new Error(
        "Meeting not found: " + meetingId
    );
}


console.log(
    "MEETING FOUND:",
    meeting
);



/*==========================================
    MEETING TIME ACCESS CONTROL
==========================================*/

const now = new Date();

const meetingStart = new Date(
    `${meeting.date}T${meeting.time}:00`
);

const duration = Number(meeting.duration) || 60;

const meetingEnd = new Date(
    meetingStart.getTime() + duration * 60000
);

console.log("CURRENT TIME:", now);
console.log("MEETING START:", meetingStart);
console.log("MEETING END:", meetingEnd);


/*==========================================
    MEETING NOT STARTED
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

    window.location.href = "meetings.html";

    throw new Error(
        "Meeting has not started yet"
    );
}


/*==========================================
    MEETING HAS ENDED
==========================================*/

if (now > meetingEnd) {

    alert(
        "This meeting has already ended."
    );

    window.location.href = "meetings.html";

    throw new Error(
        "Meeting has already ended"
    );
}

/*==========================================
VIDEO PROVIDER
==========================================*/

switch(meeting.provider){

    case "zoom":

        loadZoomMeeting(meeting);

        break;

    case "jitsi":

        loadJitsiMeeting(meeting);

        break;

    case "teams":

        loadTeamsMeeting(meeting);

        break;

    case "meet":

        loadGoogleMeetMeeting(meeting);

        break;

    default:

        loadJitsiMeeting(meeting);

}