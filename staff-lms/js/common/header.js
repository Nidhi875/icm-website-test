/*==========================================
HEADER NOTIFICATIONS
==========================================*/

// These values will come from the backend later
const unreadMessages = 0;
const unreadNotifications = 0;

const msg = document.getElementById("messageCount");
const notify = document.getElementById("notificationCount");

// Messages
if (msg) {

    if (unreadMessages > 0) {

        msg.textContent = unreadMessages;
        msg.classList.remove("hidden");

    } else {

        msg.classList.add("hidden");

    }

}

// Notifications
if (notify) {

    if (unreadNotifications > 0) {

        notify.textContent = unreadNotifications;
        notify.classList.remove("hidden");

    } else {

        notify.classList.add("hidden");

    }

}


document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
});