document.addEventListener("DOMContentLoaded", () => {

    /*
     * Gouldings Mission page
     * Fix image paths inside dynamically loaded
     * navbar and footer components.
     *
     * This is intentionally page-specific so that
     * navbar.html and footer.html are not changed.
     */

    function fixComponentImages(container) {

        if (!container) return;

        container.querySelectorAll("img").forEach(img => {

            const src = img.getAttribute("src");

            if (!src) return;

            // Only fix relative images coming from the shared components.
            if (src.startsWith("images/")) {
                img.src = "../../" + src;
            }

        });
    }


    /*
     * Watch the dynamically loaded navbar.
     */
    const navbar = document.getElementById("navbar");

    if (navbar) {

        const navbarObserver = new MutationObserver(() => {
            fixComponentImages(navbar);
        });

        navbarObserver.observe(navbar, {
            childList: true,
            subtree: true
        });

        fixComponentImages(navbar);
    }


    /*
     * Watch the dynamically loaded footer.
     */
    const footer = document.getElementById("footer");

    if (footer) {

        const footerObserver = new MutationObserver(() => {
            fixComponentImages(footer);
        });

        footerObserver.observe(footer, {
            childList: true,
            subtree: true
        });

        fixComponentImages(footer);
    }

});