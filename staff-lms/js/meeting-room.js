/*==========================================
LOAD MEETING
==========================================*/

const params = new URLSearchParams(window.location.search);

const meetingId = Number(params.get("id"));

const meetings = getMeetings();

const meeting = meetings.find(
    m => String(m.id) === String(meetingId)
);




if (!meeting) {

    alert("Meeting not found.");

    window.location.href = "dashboard.html";

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