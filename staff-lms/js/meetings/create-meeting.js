/*==========================================
CREATE MEETING
==========================================*/

function initialiseCreateMeeting(){

    const form = document.getElementById("meetingForm");

    if(!form) return;

    form.addEventListener("submit", function(e){

        e.preventDefault();

        const meeting = {

            id: Date.now(),

            title: document.getElementById("meetingTitle").value.trim(),

            tutor: document.getElementById("meetingTutor").value.trim(),

            date: document.getElementById("meetingDate").value,

            time: document.getElementById("meetingTime").value,

            duration: parseInt(
                document.getElementById("meetingDuration").value
            ) || 60,

            provider: document.getElementById("meetingProvider").value,

            attendees: 0,

            description: "",

            meetingId: "",

            meetingPassword: ""

        };

        if(
            !meeting.title ||
            !meeting.tutor ||
            !meeting.date ||
            !meeting.time
        ){

            alert("Please complete all required fields.");

            return;

        }

        const providers = {

            zoom:{
                platform:"Zoom",
                badge:"zoom"
            },

            jitsi:{
                platform:"Jitsi Meet",
                badge:"jitsi"
            },

            teams:{
                platform:"Microsoft Teams",
                badge:"teams"
            },

            meet:{
                platform:"Google Meet",
                badge:"meet"
            }

        };

        meeting.platform =
            providers[meeting.provider].platform;

        meeting.badge =
            providers[meeting.provider].badge;

            meeting.status = "UPCOMING";

        const meetings = getMeetings();

meetings.unshift(meeting);

saveMeetings(meetings);

        location.reload();
        document.getElementById("meetingModal")
            .classList.remove("show");

        form.reset();

        alert("Meeting created successfully.");

    });

}

document.addEventListener("DOMContentLoaded", () => {
    initialiseCreateMeeting();
});