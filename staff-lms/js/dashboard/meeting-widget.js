/*==========================================
GOOGLE CALENDAR MEETING WIDGET
==========================================*/

const GOOGLE_CALENDAR_API =
    "https://icm-website-test-production.up.railway.app/api/google/events";

function getStaffToken() {
    return (
        localStorage.getItem("staffToken") ||
        localStorage.getItem("token") ||
        ""
    );
}

function formatGoogleMeetingDate(dateTime) {
    if (!dateTime) return "";

    const date = new Date(dateTime);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatGoogleMeetingTime(dateTime) {
    if (!dateTime) return "";

    const date = new Date(dateTime);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

function getMeetingDuration(start, end) {
    if (!start || !end) return "";

    const minutes = Math.round(
        (new Date(end) - new Date(start)) / 60000
    );

    return minutes > 0 ? `${minutes} mins` : "";
}

async function renderMeetings() {
    const meetingsContainer =
        document.getElementById("meetingsList");

    if (!meetingsContainer) return;

    meetingsContainer.innerHTML = `
        <div class="meeting-card">
            <div class="meeting-left">
                <div class="meeting-video-icon">
                    <i data-lucide="loader-circle"></i>
                </div>
                <div class="meeting-details">
                    <h3>Loading upcoming meetings...</h3>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) {
        lucide.createIcons();
    }

    const token = getStaffToken();

    if (!token) {
        meetingsContainer.innerHTML = `
            <div class="meeting-card">
                <div class="meeting-left">
                    <div class="meeting-video-icon">
                        <i data-lucide="calendar-x"></i>
                    </div>
                    <div class="meeting-details">
                        <h3>Please log in again</h3>
                        <p class="meeting-tutor">Your Staff LMS session is not available.</p>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        return;
    }

    try {
        const response = await fetch(GOOGLE_CALENDAR_API, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.status === 401) {
            localStorage.removeItem("staffLoggedIn");
            localStorage.removeItem("staffName");
            localStorage.removeItem("staffEmail");
            localStorage.removeItem("staffRole");
            localStorage.removeItem("staffId");
            localStorage.removeItem("staffToken");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load meetings.");
        }

        const meetings = data.events || [];

        if (meetings.length === 0) {
            meetingsContainer.innerHTML = `
                <div class="meeting-card">
                    <div class="meeting-left">
                        <div class="meeting-video-icon">
                            <i data-lucide="calendar-check"></i>
                        </div>
                        <div class="meeting-details">
                            <h3>No upcoming meetings</h3>
                            <p class="meeting-tutor">Your Google Calendar has no upcoming events.</p>
                        </div>
                    </div>
                </div>
            `;

            if (window.lucide) lucide.createIcons();
            return;
        }

        meetingsContainer.innerHTML = meetings.map(meeting => {
            const duration = getMeetingDuration(meeting.start, meeting.end);
            const hasMeet = Boolean(meeting.meetUrl);

            return `
                <div class="meeting-card">
                    <div class="meeting-left">
                        <div class="meeting-video-icon">
                            <i data-lucide="video"></i>
                        </div>

                        <div class="meeting-details">
                            <span class="meeting-status upcoming">UPCOMING</span>

                            <h3>${escapeMeetingText(meeting.title)}</h3>

                            <div class="meeting-meta">
                                <span>
                                    <i class="fa-regular fa-calendar"></i>
                                    ${formatGoogleMeetingDate(meeting.start)}
                                </span>

                                <span>•</span>

                                <span>
                                    <i class="fa-regular fa-clock"></i>
                                    ${formatGoogleMeetingTime(meeting.start)}
                                </span>

                                ${duration ? `
                                    <span>•</span>
                                    <span>${duration}</span>
                                ` : ""}
                            </div>
                        </div>
                    </div>

                    <div class="meeting-right">
                        ${hasMeet ? `
                            <button
                                class="join-btn"
                                onclick="joinGoogleMeeting('${encodeURIComponent(meeting.meetUrl)}')">
                                <i class="fa-solid fa-video"></i>
                                Join Meeting
                            </button>
                        ` : `
                            <button
                                class="join-btn"
                                onclick="openGoogleCalendarEvent('${encodeURIComponent(meeting.htmlLink || "") }')">
                                <i class="fa-solid fa-calendar"></i>
                                Open Calendar
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join("");

        if (window.lucide) {
            lucide.createIcons();
        }
    } catch (error) {
        console.error("MEETING WIDGET ERROR:", error);

        meetingsContainer.innerHTML = `
            <div class="meeting-card">
                <div class="meeting-left">
                    <div class="meeting-video-icon">
                        <i data-lucide="calendar-x"></i>
                    </div>
                    <div class="meeting-details">
                        <h3>Unable to load meetings</h3>
                        <p class="meeting-tutor">${escapeMeetingText(error.message)}</p>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }
}

function joinGoogleMeeting(encodedUrl) {
    const url = decodeURIComponent(encodedUrl || "");

    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
}

function openGoogleCalendarEvent(encodedUrl) {
    const url = decodeURIComponent(encodedUrl || "");

    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
}

function escapeMeetingText(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.renderMeetings = renderMeetings;
