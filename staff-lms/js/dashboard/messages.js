const API_URL = "http://localhost:5000/api/messages";

document.addEventListener("DOMContentLoaded", () => {

    console.log("MESSAGES JS STARTED");

    const form = document.getElementById("messageForm");
    const input = document.getElementById("messageInput");

    if (!form) {
        console.error("MESSAGE FORM NOT FOUND");
        return;
    }

    if (!input) {
        console.error("MESSAGE INPUT NOT FOUND");
        return;
    }

    // Load existing database messages
    loadMessages();

    // Send when form is submitted
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        await sendMessage();
    });

});


/* ==========================================================
   LOAD MESSAGES
   ========================================================== */

async function loadMessages() {

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        console.log("GET MESSAGES:", data);

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load messages"
            );
        }

        renderMessages(data.messages || []);

    } catch (error) {

        console.error("LOAD MESSAGES ERROR:", error);

    }

}


/* ==========================================================
   SEND MESSAGE
   ========================================================== */

async function sendMessage() {

    const input = document.getElementById("messageInput");
    const button = document.getElementById("sendMessageButton");

    if (!input) {
        console.error("Message input not found.");
        return;
    }

    const text = input.value.trim();

    if (!text) {
        return;
    }

    if (button) {
        button.disabled = true;
    }

    console.log("SENDING MESSAGE:", text);

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                senderId: null,

                senderName: "Claire",

                senderRole: "Administrator",

                recipientId: null,

                conversationId: "staff-general",

                messageText: text,

                messageType: "text"

            })

        });

        const data = await response.json();

        console.log("POST MESSAGES RESPONSE:", data);

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Failed to send message"
            );

        }

        // Clear input
        input.value = "";

        // Reload directly from PostgreSQL
        await loadMessages();

    } catch (error) {

        console.error("SEND MESSAGE ERROR:", error);

        alert(
            "Message could not be sent.\n\n" +
            error.message
        );

    } finally {

        if (button) {
            button.disabled = false;
        }

    }

}


/* ==========================================================
   RENDER DATABASE MESSAGES
   ========================================================== */

function renderMessages(messages) {

    const container =
        document.querySelector(".chat-messages");

    if (!container) {

        console.error(
            "CHAT MESSAGES CONTAINER NOT FOUND"
        );

        return;
    }

    container.innerHTML = "";

    if (!messages.length) {

        container.innerHTML = `
            <div class="no-messages">
                No messages yet.
            </div>
        `;

        return;
    }

    // API gives newest first.
    // Show oldest first.
    const orderedMessages =
        [...messages].reverse();

    orderedMessages.forEach(message => {

        const row =
            document.createElement("div");

        row.className =
            "message-row received";

        row.innerHTML = `

            <div class="message-avatar initials-avatar">
                ${getInitials(message.sender_name)}
            </div>

            <div class="message-content">

                <div class="message-name">

                    ${escapeHtml(
                        message.sender_name || "Unknown"
                    )}

                    <span>
                        ${escapeHtml(
                            message.sender_role || ""
                        )}
                    </span>

                </div>

                <div class="message-bubble">

                    ${escapeHtml(
                        message.message_text || ""
                    )}

                </div>

                <div class="message-time">

                    ${formatMessageTime(
                        message.created_at
                    )}

                </div>

            </div>

        `;

        container.appendChild(row);

    });

    container.scrollTop =
        container.scrollHeight;

}


/* ==========================================================
   HELPERS
   ========================================================== */

function getInitials(name) {

    if (!name) {
        return "?";
    }

    return name
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

}


function formatMessageTime(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString);

    if (isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });

}


function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================================
   MESSAGES PAGE ACTION BUTTONS
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // NEW MESSAGE
    const newMessageBtn = document.getElementById("newMessageBtn");

    if (newMessageBtn) {
        newMessageBtn.addEventListener("click", () => {

            const input = document.getElementById("messageInput");

            if (input) {
                input.focus();

                // Scroll the chat area into view
                input.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        });
    }


    // ANNOUNCEMENT
    const announcementBtn = document.getElementById("announcementBtn");

    if (announcementBtn) {
        announcementBtn.addEventListener("click", () => {

            const announcement = prompt(
                "Enter your announcement:"
            );

            if (!announcement || !announcement.trim()) {
                return;
            }

            sendAnnouncement(announcement.trim());
        });
    }


    // CREATE GROUP
    const createGroupBtn = document.getElementById("createGroupBtn");

    if (createGroupBtn) {
        createGroupBtn.addEventListener("click", () => {

            const groupName = prompt(
                "Enter the name of the new group:"
            );

            if (!groupName || !groupName.trim()) {
                return;
            }

            alert(
                `Group "${groupName.trim()}" is ready to be created.`
            );
        });
    }

});


/* ==========================================================
   SEND ANNOUNCEMENT
========================================================== */

async function sendAnnouncement(text) {

    try {

        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                senderId: null,
                senderName: "Claire",
                senderRole: "Administrator",
                recipientId: null,
                conversationId: "staff-general",
                messageText: text,
                messageType: "announcement"
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Failed to send announcement"
            );
        }

        await loadMessages();

        alert("Announcement sent successfully.");

    } catch (error) {

        console.error(
            "SEND ANNOUNCEMENT ERROR:",
            error
        );

        alert("Unable to send announcement.");
    }
}