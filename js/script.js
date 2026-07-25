const slider = document.getElementById("slider");

function slideRight() {

    slider.scrollBy({
        left: 385,
        behavior: "smooth"
    });

}

function slideLeft() {

    slider.scrollBy({
        left: -385,
        behavior: "smooth"
    });

}

const blocks = document.querySelectorAll(".story-block");
const images = document.querySelectorAll(".story-image");

const observer = new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

const targetImage =
entry.target.dataset.image;

images.forEach(img=>{
img.classList.remove("active");
});

document
.getElementById(targetImage)
.classList.add("active");

}

});

},
{
threshold:0.5
}

);

blocks.forEach(block=>{
observer.observe(block);
});

// MOBILE QUALIFICATIONS SIDEBAR

const sidebarMenu =
document.querySelector(".sidebar-menu");

const activeMain =
document.querySelector(".active-main");

if(sidebarMenu && activeMain){

activeMain.addEventListener("click",()=>{

if(window.innerWidth<=768){

sidebarMenu.classList.toggle("open");

}

});

}


/* ==========================================
QUALIFICATIONS MOBILE SIDEBAR
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    if (window.innerWidth > 768) return;

    const toggle = document.querySelector(".active-main");
    const sidebar = document.querySelector(".sidebar-menu");

    if (!toggle || !sidebar) return;

    toggle.addEventListener("click", function () {
        sidebar.classList.toggle("open");
    });

});

