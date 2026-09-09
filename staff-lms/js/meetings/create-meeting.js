/*==========================================
CREATE MEETING
==========================================*/
const GOOGLE_API_BASE_URL =
    "https://icm-website-test-production.up.railway.app";


async function initialiseCreateMeeting(){

    const form = document.getElementById("meetingForm");

    if(!form) return;

    const connectGoogleButton =
        document.getElementById("connectGoogleCalendar");

    if (connectGoogleButton) {
        connectGoogleButton.addEventListener("click", async () => {
            const token = localStorage.getItem("staffToken");

            if (!token) {
                alert("Your staff login session has expired. Please log in again.");
                return;
            }

            connectGoogleButton.disabled = true;

            try {
                const response = await fetch(
                    `${GOOGLE_API_BASE_URL}/api/google/auth`,
                    { headers: { "Authorization": `Bearer ${token}` } }
                );
                const data = await response.json();

                if (!response.ok || !data.authUrl) {
                    throw new Error(data.message || "Unable to start Google Calendar connection.");
                }

                window.location.href = data.authUrl;
            } catch (error) {
                console.error("GOOGLE CALENDAR CONNECTION ERROR:", error);
                alert(error.message || "Unable to start Google Calendar connection.");
                connectGoogleButton.disabled = false;
            }
        });
    }

    form.addEventListener("submit", async function(e){

        e.preventDefault();

        const editingId = form.dataset.editingId;
        const existingMeeting = editingId
            ? getMeetings().find(item => String(item.id) === String(editingId))
            : null;

        const meeting = {

            id: existingMeeting?.id || Date.now(),

            title: document.getElementById("meetingTitle").value.trim(),

            tutor: document.getElementById("meetingTutor").value.trim(),

            date: document.getElementById("meetingDate").value,

            time: document.getElementById("meetingTime").value,

            duration: parseInt(
                document.getElementById("meetingDuration").value
            ) || 60,

            provider: document.getElementById("meetingProvider").value,

            attendees: existingMeeting?.attendees || 0,

            description:
                document.getElementById("meetingDescription")?.value.trim() || "",

            meetingId: existingMeeting?.meetingId || "",

            meetingPassword: existingMeeting?.meetingPassword || "",

            join: existingMeeting?.join || "#"

        };


        /*==========================================
        VALIDATE
        ==========================================*/

        if(
            !meeting.title ||
            !meeting.tutor ||
            !meeting.date ||
            !meeting.time
        ){

            alert("Please complete all required fields.");

            return;

        }


        /*==========================================
        PROVIDERS
        ==========================================*/

        const providers = {

            gouldings: {
                platform: "Gouldings Meeting",
                badge: "gouldings"
            },

            meet: {
                platform: "Google Meet",
                badge: "meet"
            }

        };


        meeting.platform =
            providers[meeting.provider]?.platform || "Google Meet";

        meeting.badge =
            providers[meeting.provider]?.badge || "meet";

        meeting.status = "UPCOMING";


        /*==========================================
        GOOGLE MEET
        ==========================================*/

        if(meeting.provider === "meet" && !(existingMeeting && existingMeeting.provider === "meet" && existingMeeting.join && existingMeeting.join !== "#")){

            const token =
                localStorage.getItem("staffToken");

            if(!token){

                alert(
                    "Your staff login session has expired. Please log in again."
                );

                return;

            }


            try {

                const response = await fetch(
                      `${GOOGLE_API_BASE_URL}/api/google/create-meet`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            title: meeting.title,

                            date: meeting.date,

                            time: meeting.time,

                            duration: meeting.duration

                        })
                    }
                );


                const data = await response.json();


                console.log(
                    "GOOGLE MEET RESPONSE:",
                    response.status,
                    data
                );


                /*==========================================
                GOOGLE AUTH REQUIRED
                ==========================================*/

                if(
                    response.status === 400 &&
                    data.message?.includes(
                        "Google Calendar is not connected"
                    )
                ){

                    alert(
                        "Google Calendar is not connected. Please connect your Google account first."
                    );

                    return;

                }


                /*==========================================
                OTHER API ERROR
                ==========================================*/

                if(!response.ok){

                    alert(
                        data.message ||
                        "Unable to create Google Meet."
                    );

                    return;

                }


                /*==========================================
                MEET STILL BEING CREATED
                ==========================================*/

                if(data.pending){

                    alert(
                        "Google Meet is still being created. Please try again shortly."
                    );

                    return;

                }


                /*==========================================
                MEET CREATED
                ==========================================*/

                if(data.success && data.meetUrl){

                    meeting.join =
                        data.meetUrl;

                    meeting.meetingId =
                        data.googleEventId || "";

                    console.log(
                        "GOOGLE MEET CREATED:",
                        data.meetUrl
                    );

                } else {

                    alert(
                        "Google Meet could not be created."
                    );

                    return;

                }


            } catch(error){

                console.error(
                    "GOOGLE MEET REQUEST ERROR:",
                    error
                );

                alert(
                    "Unable to connect to the Google Meet service."
                );

                return;

            }

        }


        /*==========================================
        SAVE MEETING
        ==========================================*/

        const meetings =
            getMeetings();

        const updatedMeetings = existingMeeting
            ? meetings.map(item => String(item.id) === String(meeting.id) ? meeting : item)
            : [meeting, ...meetings];

        saveMeetings(updatedMeetings);


        /*==========================================
        CLOSE MODAL
        ==========================================*/

        const modal =
            document.getElementById("meetingModal");

        if(modal){

            modal.classList.remove("show");

        }

        form.reset();
        delete form.dataset.editingId;
        const modalHeading = modal?.querySelector(".modal-header h2");
        if (modalHeading) {
            modalHeading.textContent = "Create New Meeting";
        }


        /*==========================================
        SUCCESS
        ==========================================*/

        alert(
            meeting.provider === "meet"
                ? "Google Meet created successfully."
                : "Meeting created successfully."
        );


        location.reload();

    });

}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initialiseCreateMeeting();

    }
);