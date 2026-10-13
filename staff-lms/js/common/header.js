
/* ==========================================
   STAFF LMS HEADER INITIALIZATION
========================================== */

(() => {
    "use strict";

    function initializeHeader() {
        // Initialize the mobile menu only if the function exists.
        if (typeof window.initMobileMenu === "function") {
            window.initMobileMenu();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeHeader,
            { once: true }
        );
    } else {
        initializeHeader();
    }
})();
