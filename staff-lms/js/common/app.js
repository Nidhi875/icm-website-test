/*==========================================
COMPONENT LOADER
==========================================*/

/*==========================================
COMPONENT LOADER
==========================================*/

async function loadComponent(url, selector) {

    const element = document.querySelector(selector);

    if (!element) {
        return;
    }

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Unable to load ${url}`);
        }

        const html = await response.text();

        element.innerHTML = html;

    } catch (error) {

        console.error(error);

        element.innerHTML = `
            <div style="padding:20px;color:red;">
                Failed to load ${url}
            </div>
        `;
    }

}

/*==========================================
LOAD ALL COMPONENTS
==========================================*/

async function loadLayout() {

    await Promise.all([


        loadComponent("layouts/sidebar.html", "#sidebar"),
loadComponent("layouts/header.html", "#header"),
loadComponent("components/welcome-banner.html", "#welcomeBanner"),
loadComponent("components/schedule-widget.html", "#scheduleWidget"),
loadComponent("components/calendar-widget.html", "#calendarWidget"),
loadComponent("components/meeting-widget.html", "#meetingsWidget")

    ]);
   

    if (typeof renderMeetings === "function") {
    renderMeetings();
}


    /* Render Lucide Icons */
    if (window.lucide) {
        lucide.createIcons();
    }

    /* Highlight Active Menu */
    setActiveLink();

    /* Profile Photo Upload */
    initProfilePhotoUpload();


    /* Load Logged-in Staff */
    loadStaffInfo();
    
}






/*==========================================
PROFILE PHOTO UPLOAD
==========================================*/

const PROFILE_PHOTO_KEY = "staffProfilePhoto";

function initProfilePhotoUpload() {

    const img = document.getElementById("sidebarProfilePic");
    const input = document.getElementById("profilePicUpload");

    if (!img || !input) return;

    /* Show a previously saved photo, if any */
    const savedPhoto = localStorage.getItem(PROFILE_PHOTO_KEY);
    if (savedPhoto) {
        img.src = savedPhoto;
    }

    /* Handle a new upload */
    input.addEventListener("change", (event) => {

        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please choose an image file.");
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            alert("Please choose an image smaller than 3MB.");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            img.src = reader.result;
            localStorage.setItem(PROFILE_PHOTO_KEY, reader.result);
        };

        reader.readAsDataURL(file);

    });

}


/*==========================================
ACTIVE SIDEBAR LINK
==========================================*/

function setActiveLink() {

    const currentPage = window.location.pathname.split("/").pop();

    document.querySelectorAll(".sidebar-link").forEach(link => {

        const href = link.getAttribute("href");

        if (href === currentPage) {

            link.classList.add("active");

        } else {

            link.classList.remove("active");

        }

    });

}

/*==========================================
INITIALIZE
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadLayout();

});

/*==========================================
LOAD STAFF INFORMATION
==========================================*/

function loadStaffInfo() {

    // Temporary values
    // Later these will come from the login system

    const staff = {

        name: localStorage.getItem("staffName") || "Staff Member",

        role: localStorage.getItem("staffRole") || "Administrator"

    };

    // Welcome Banner

    const welcomeName = document.getElementById("welcomeName");

    if (welcomeName) {

        welcomeName.textContent = staff.name;

    }

    // Header

    const headerName = document.getElementById("headerStaffName");

    const headerRole = document.getElementById("headerStaffRole");

    if (headerName) headerName.textContent = staff.name;

    if (headerRole) headerRole.textContent = staff.role;

    // Sidebar

    const sidebarName = document.getElementById("sidebarStaffName");

    const sidebarRole = document.getElementById("sidebarStaffRole");

    if (sidebarName) sidebarName.textContent = staff.name;

    if (sidebarRole) sidebarRole.textContent = staff.role;

}



/*==========================================
MEETING STATUS ENGINE
==========================================*/

function getMeetingStatus(meeting){

    const now = new Date();

    const meetingStart = new Date(`${meeting.date}T${meeting.time}:00`);

    const meetingEnd = new Date(
        meetingStart.getTime() + meeting.duration * 60000
    );

    const diffMinutes = Math.floor(
        (meetingStart.getTime() - now.getTime()) / 60000
    );

    const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // LIVE
    if(now >= meetingStart && now <= meetingEnd){

        return{
            text:"LIVE",
            class:"live"
        };

    }

    // Starts within 60 minutes
    if(diffMinutes > 0 && diffMinutes <= 60){

        return{
            text:`Starts in ${diffMinutes} min`,
            class:"upcoming"
        };

    }

    // Today (later than 60 min)
    if(meetingStart.toDateString() === today.toDateString()){

        return{
            text:"Today",
            class:"upcoming"
        };

    }

    // Tomorrow
    if(meetingStart.toDateString() === tomorrow.toDateString()){

        return{
            text:"Tomorrow",
            class:"upcoming"
        };

    }

    // Completed
    if(now > meetingEnd){

        return{
            text:"Completed",
            class:"completed"
        };

    }

    // Future
    return{

        text:"Upcoming",
        class:"upcoming"

    };

}

/*==========================================
MEETING DATE FORMATTER
==========================================*/

function formatMeetingDate(meeting){

    const today = new Date();

    const meetingDate = new Date(meeting.date);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate()-1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate()+1);

    if(meetingDate.toDateString()===today.toDateString()){

        return "Today";

    }

    if(meetingDate.toDateString()===tomorrow.toDateString()){

        return "Tomorrow";

    }

    if(meetingDate.toDateString()===yesterday.toDateString()){

        return "Yesterday";

    }

    return meetingDate.toLocaleDateString("en-GB",{

        day:"2-digit",

        month:"short",

        year:"numeric"

    });

}