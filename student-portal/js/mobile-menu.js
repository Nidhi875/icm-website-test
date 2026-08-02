document.addEventListener("DOMContentLoaded", function () {

    const menuBtn = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeBtn = document.getElementById("closeMenu");
    const logo = document.querySelector(".portal-logo");

    if (menuBtn && mobileMenu && closeBtn && logo) {

        // Open Menu
        menuBtn.addEventListener("click", function () {

            mobileMenu.classList.add("active");
            logo.style.visibility = "hidden";

        });

        // Close Menu
        closeBtn.addEventListener("click", function () {

            mobileMenu.classList.remove("active");
            logo.style.visibility = "visible";

        });

    }

});