(() => {
    "use strict";

    console.log("notifications.js loaded");

    const NOTIFICATIONS_API =
        "https://icm-website-test-production.up.railway.app/api/notifications";

    const MESSAGES_API =
        "https://icm-website-test-production.up.railway.app/api/messages";


    /* ==========================================================
       UPDATE NOTIFICATION BADGE
    ========================================================== */

    async function updateNotificationBadge() {

        const badge =
            document.getElementById("notificationCount");

        if (!badge) return;

        try {

            const response =
                await fetch(NOTIFICATIONS_API);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const data =
                await response.json();

            const notifications =
                Array.isArray(data.notifications)
                    ? data.notifications
                    : [];

            const count =
                notifications.length;

            if (count > 0) {

                badge.textContent = count;
                badge.classList.remove("hidden");

            } else {

                badge.textContent = "";
                badge.classList.add("hidden");

            }

            console.log(
                "NOTIFICATION COUNT:",
                count
            );

        } catch (error) {

            console.error(
                "NOTIFICATION BADGE ERROR:",
                error
            );

        }
    }


    /* ==========================================================
       UPDATE MESSAGE BADGE
       Counts unread messages only
    ========================================================== */

    async function updateMessageBadge() {

        const badge =
            document.getElementById("messageCount");

        if (!badge) return;

        try {

            const response =
                await fetch(MESSAGES_API);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const data =
                await response.json();

            const messages =
                Array.isArray(data.messages)
                    ? data.messages
                    : [];

            const unreadCount =
                messages.filter(
                    message =>
                        !message.is_read
                ).length;

            if (unreadCount > 0) {

                badge.textContent =
                    unreadCount;

                badge.classList.remove("hidden");

            } else {

                badge.textContent = "";
                badge.classList.add("hidden");

            }

            console.log(
                "UNREAD MESSAGE COUNT:",
                unreadCount
            );

        } catch (error) {

            console.error(
                "MESSAGE BADGE ERROR:",
                error
            );

        }
    }


    /* ==========================================================
       UPDATE BOTH BADGES
    ========================================================== */

    async function updateHeaderCounts() {

        await Promise.all([
            updateNotificationBadge(),
            updateMessageBadge()
        ]);

    }


    /* ==========================================================
       INITIAL LOAD
    ========================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            updateHeaderCounts();

            /*
             * Refresh every 30 seconds so the header
             * updates automatically without refreshing
             * the page.
             */
            setInterval(
                updateHeaderCounts,
                30000
            );

        },
        { once: true }
    );

})();