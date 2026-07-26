/* =====================================================
GOULDINGS CHECKOUT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Load shared navbar
    fetch("components/navbar.html")
        .then(response => response.text())
        .then(data => {
            const navbar = document.getElementById("navbar-placeholder");
            if (navbar) {
                navbar.innerHTML = data;

                // Reinitialize navbar functionality
                if (typeof initializeNavigation === "function") {
                    initializeNavigation();
                }
            }
        });

    // Load shared footer
    fetch("components/footer.html")
        .then(response => response.text())
        .then(data => {
            const footer = document.getElementById("footer-placeholder");
            if (footer) {
                footer.innerHTML = data;
            }
        });

    // Coupon button (placeholder)
    const couponButton = document.querySelector(".coupon-box button");

    if (couponButton) {
        couponButton.addEventListener("click", function (e) {

            e.preventDefault();

            alert("Coupon functionality will be connected soon.");

        });
    }

    // Checkout button (placeholder)
    const checkoutButton = document.querySelector(".checkout-btn");

    if (checkoutButton) {

        checkoutButton.addEventListener("click", function () {

            alert(
                "Payment gateway will be connected in the next phase."
            );

        });

    }

});