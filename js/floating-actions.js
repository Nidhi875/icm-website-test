/*=========================================================
GOULDINGS GLOBAL ACADEMY
FLOATING ADMISSIONS PANEL
=========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    const panel = document.getElementById("admissionsPanel");
    const trigger = document.getElementById("phoneTrigger");
    const apply = document.querySelector(".apply-tab");

    if (!panel || !trigger) return;

    // Auto-open after page load
    setTimeout(() => {
        panel.classList.add("show");
    }, 800);

    // Close after 3.5 seconds
    setTimeout(() => {
        panel.classList.remove("show");
    }, 4300);

    // Desktop hover
    if (window.innerWidth > 768) {

        panel.addEventListener("mouseenter", () => {
            panel.classList.add("show");
        });

        panel.addEventListener("mouseleave", () => {
            panel.classList.remove("show");
        });

    }

    // Mobile click
    trigger.addEventListener("click", (e) => {

        e.preventDefault();

        panel.classList.toggle("show");

    });

    // Apply button pulse every 8 seconds
    if (apply) {

        setInterval(() => {

            apply.classList.add("pulse");

            setTimeout(() => {
                apply.classList.remove("pulse");
            }, 800);

        }, 8000);

    }

});