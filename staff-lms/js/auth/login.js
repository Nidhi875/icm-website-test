/*==================================================
GOULDINGS STAFF LMS
LOGIN
==================================================*/

const STAFF_EMAILS = [
    "derrick.mason@gouldings.education",
    "claire@gouldings.education"
];

const STAFF_PASSWORD = "DistanceAdmin2026@Gouldings";
/*==================================================
SHOW / HIDE PASSWORD
==================================================*/

const toggleBtn = document.getElementById("togglePassword");

if(toggleBtn){

    toggleBtn.addEventListener("click",()=>{

        const password =
            document.getElementById("password");

        const icon =
            toggleBtn.querySelector("i");

        if(password.type==="password"){

            password.type="text";

            icon.classList.remove("fa-eye");

            icon.classList.add("fa-eye-slash");

        }else{

            password.type="password";

            icon.classList.remove("fa-eye-slash");

            icon.classList.add("fa-eye");

        }

    });

}

/*==================================================
LOGIN
==================================================*/

document
.getElementById("loginForm")
.addEventListener("submit",function(e){

    e.preventDefault();

   const email =
    document
    .getElementById("email")
    .value
    .trim()
    .toLowerCase();



    const password =
        document
        .getElementById("password")
        .value;

    const message =
        document
        .getElementById("loginMessage");

    message.textContent="";


    if (
    STAFF_EMAILS.includes(email) &&
    password === STAFF_PASSWORD
    ) {


        localStorage.setItem("staffLoggedIn","true");

        if (email === "derrick.mason@gouldings.education") {
         localStorage.setItem("staffName", "Derrick Mason");
        } else if (email === "claire@gouldings.education") {
        localStorage.setItem("staffName", "Claire");
        }

      localStorage.setItem("staffEmail", email);

        localStorage.setItem("staffEmail",email);

        message.style.color="#16a34a";

        message.textContent="Login successful...";

        setTimeout(()=>{

            document.body.style.overflow = "auto";
           document.documentElement.style.overflow = "auto";

            window.location.href="dashboard.html";

        },700);

    }

    else{

        message.style.color="#dc2626";

        message.textContent="Invalid email or password.";

    }

});