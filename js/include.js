console.log("include.js loaded");

document.addEventListener("DOMContentLoaded", () => {

    // NAVBAR
   fetch("/components/navbar.html")
    .then(r => r.text())
    .then(data => {

        const navbar =
            document.getElementById("navbar");

        if (navbar) {
            navbar.innerHTML = data;
        }

        // MOBILE MENU
        const menuBtn =
            document.querySelector(".menu-toggle");

        const nav =
            document.querySelector("nav");

        if(menuBtn && nav){

            menuBtn.addEventListener(
                "click",
                () => {

                    nav.classList.toggle(
                        "active"
                    );

                }
            );

        }

   // NAVBAR ACTIVE PAGE + MOBILE DROPDOWN MENUS

const submenuItems =
    document.querySelectorAll(".nav-item--has-submenu:not(.nav-item--nested)");

const currentPath =
    window.location.pathname.replace(/\/+$/, "") || "/";


submenuItems.forEach(item => {

    const button =
        item.querySelector(".nav-title");

    const submenuLinks =
        item.querySelectorAll(".nav-submenu a");

    let parentIsActive = false;

    // Reset this dropdown first
    item.classList.remove("active");

    submenuLinks.forEach(link => {

        link.classList.remove("active");

        const href =
            link.getAttribute("href");

        if (!href) return;

        const linkPath =
            new URL(href, window.location.href)
                .pathname
                .replace(/\/+$/, "") || "/";

        if (linkPath === currentPath) {

            parentIsActive = true;

            link.classList.add("active");

        }

    });


    // ONLY the parent containing the current page is active
    if (parentIsActive) {

        item.classList.add("active");

        if (button) {
            button.setAttribute(
                "aria-expanded",
                "true"
            );
        }

    } else {

        item.classList.remove("open");

        if (button) {
            button.setAttribute(
                "aria-expanded",
                "false"
            );
        }

    }

    // Mobile dropdown behaviour
    if (button) {

        button.addEventListener("click", () => {

            if (window.innerWidth > 768) return;


            // Close other dropdowns
            submenuItems.forEach(other => {

                if (other !== item) {

                    other.classList.remove("open");

                    other
                        .querySelector(".nav-title")
                        ?.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                }

            });


            const isOpen =
                item.classList.toggle("open");

            button.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });

    }

});


// Highlight normal top-level links
nav.querySelectorAll(":scope > a").forEach(link => {

    const href =
        link.getAttribute("href");

    if (!href) return;


    const linkPath =
        new URL(href, window.location.href)
            .pathname
            .replace(/\/+$/, "") || "/";


    if (linkPath === currentPath) {

        link.classList.add("active");

    }

});


    // NESTED ACADEMY ACCORDION (Business Academy, Tourism & Hospitality,
    // etc. inside the Qualifications dropdown/sidebar). Works on click,
    // on both desktop and mobile. This has to live here in include.js:
    // a <script> tag placed inside navbar.html or the sidebar's HTML
    // never runs, because that content is inserted via innerHTML, and
    // browsers do not execute scripts added that way.
    // Reusable so it can be called again once the sidebar loads
    // (the sidebar loads later, in its own separate fetch below).

    function setupNestedAccordions(root) {

        const nestedAcademyItems =
            root.querySelectorAll(".nav-item--nested");

        nestedAcademyItems.forEach(item => {

            const nestedButton = item.querySelector(":scope > .nav-title");

            if (!nestedButton) return;

            nestedButton.addEventListener("click", (e) => {

                e.preventDefault();
                e.stopPropagation();

                const isOpen = item.classList.contains("nested-open");

                // Close any other open item in the same dropdown
                // so only one is expanded at a time.
                const parentSubmenu = item.closest(".nav-submenu");

                if (parentSubmenu) {
                    parentSubmenu
                        .querySelectorAll(":scope > .nav-item--nested")
                        .forEach(other => {
                            if (other !== item) {
                                other.classList.remove("nested-open");
                                other
                                    .querySelector(":scope > .nav-title")
                                    ?.setAttribute("aria-expanded", "false");
                            }
                        });
                }

                item.classList.toggle("nested-open", !isOpen);
                nestedButton.setAttribute("aria-expanded", String(!isOpen));
            });

        });
    }

    // Run it now for the navbar (already loaded above)
    setupNestedAccordions(document);


    // SIDEBAR
    const sidebar =
        document.getElementById(
            "qualification-sidebar"
        );

    if (sidebar) {

        fetch(
            "components/qualifications-sidebar.html"
        )
        .then(r => r.text())
        .then(data => {
            sidebar.innerHTML = data;

            // Run it again now that the sidebar's own nested
            // Qualifications accordion items exist in the DOM.
            setupNestedAccordions(sidebar);
        });

    }


    // FOOTER
    const footer =
        document.getElementById("footer");

    if (footer) {

        fetch("/components/footer.html")
            .then(r => r.text())
            .then(data => {

                footer.innerHTML = data;

                console.log(
                    "Footer Loaded"
                );

            })
            .catch(err => {

                console.error(
                    "Footer Error:",
                    err
                );

            });

    }

    });

});