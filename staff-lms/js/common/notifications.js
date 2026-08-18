console.log("notifications.js loaded");

const API_URL = "http://localhost:5000/api/notifications";

async function loadNotifications() {
    console.log("Loading notifications...");

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        console.log("Data:", data);   // Already there

        const badge = document.getElementById("notificationCount");

        console.log("Badge element:", badge);   // <-- ADD HERE

        if (!badge) return;

        const count = data.notifications.length;

        console.log("Count =", count);   // <-- ADD HERE

        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove("hidden");
            console.log("Badge updated to:", badge.textContent);   // <-- ADD HERE
        } else {
            badge.classList.add("hidden");
        }

    } catch (err) {
        console.error(err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadNotifications();

    setInterval(loadNotifications, 600000);
});