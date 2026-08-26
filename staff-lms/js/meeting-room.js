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
const meeting = meetings.find(
    m => String(m.id) === String(meetingId)
);


if (!meeting) {

    console.error(
        "MEETING NOT FOUND:",
        meetingId
    );

    alert(
        "Meeting not found. The meeting may have been deleted."
    );

    window.location.href = "meetings.html";

    /*
       IMPORTANT:
       Stop execution after redirect.
    */
    throw new Error(
        "Meeting not found: " + meetingId
    );
}


console.log(
    "MEETING LOADED:",
    meeting
);

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