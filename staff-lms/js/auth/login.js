/*==================================================
GOULDINGS STAFF LMS
LOGIN
==================================================*/

/*==================================================
SHOW / HIDE PASSWORD
==================================================*/

const toggleBtn = document.getElementById("togglePassword");

if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {

        const password = document.getElementById("password");
        const icon = toggleBtn.querySelector("i");

        if (password.type === "password") {
            password.type = "text";

            if (icon) {
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            }

        } else {
            password.type = "password";

            if (icon) {
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
        }
    });
}


/*==================================================
LOGIN
==================================================*/

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const password = document
            .getElementById("password")
            .value;

        const message = document
            .getElementById("loginMessage");

        message.textContent = "";
        message.style.color = "";


        /*==================================================
        SEND LOGIN TO BACKEND
        ==================================================*/

        try {

            const response = await fetch(
                "https://icm-website-test-production.up.railway.app/api/staff/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            /*==================================================
            LOGIN FAILED
            ==================================================*/

            if (!response.ok || !data.success) {

                message.style.color = "#dc2626";

                message.textContent =
                    data.message || "Invalid email or password.";

                return;
            }


            /*==================================================
            LOGIN SUCCESSFUL
            ==================================================*/

            const staff = data.user;


            /*==================================================
            SAVE LOGGED-IN STAFF
            ==================================================*/

            localStorage.setItem(
                "staffLoggedIn",
                "true"
            );

            localStorage.setItem(
                "staffId",
                staff.id
            );

            localStorage.setItem(
                "staffName",
                staff.name
            );

            localStorage.setItem(
                "staffEmail",
                staff.email
            );

            localStorage.setItem(
                "staffRole",
                staff.role
            );


            /*==================================================
            SUCCESS MESSAGE
            ==================================================*/

            message.style.color = "#16a34a";

            message.textContent =
                "Login successful...";


            /*==================================================
            GO TO DASHBOARD
            ==================================================*/

            setTimeout(() => {

                document.body.style.overflow = "auto";
                document.documentElement.style.overflow = "auto";

                window.location.href = "dashboard.html";

            }, 700);

        }


        /*==================================================
        SERVER / NETWORK ERROR
        ==================================================*/

        catch (error) {

            console.error("LOGIN ERROR:", error);

            message.style.color = "#dc2626";

            message.textContent =
                "Unable to connect to the server. Please try again.";
        }

    });
}

