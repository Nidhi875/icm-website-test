console.log("include.js loaded");

document.addEventListener("DOMContentLoaded", () => {

    // Navbar
    fetch("components/navbar.html")
        .then(r => r.text())
        .then(data => {
            document.getElementById("navbar").innerHTML = data;

            const page = window.location.pathname.split("/").pop();

            if(page === "" || page === "index.html")
                document.getElementById("nav-home")?.classList.add("active");

            if(page === "qualifications.html")
                document.getElementById("nav-qualifications")?.classList.add("active");
        });
  

    const menuBtn =
document.querySelector(
".menu-toggle"
);

const nav =
document.querySelector("nav");

if(menuBtn){

menuBtn.addEventListener(
"click",
()=>{

    nav.classList.toggle(
        "active"
    );

});

}


    // Qualifications Sidebar
    const sidebar = document.getElementById("qualification-sidebar");

    if(sidebar){

        fetch("components/qualifications-sidebar.html")
            .then(r => r.text())
            .then(data => {
                sidebar.innerHTML = data;
            });

    }

    // Footer
    fetch("components/footer.html")
        .then(r => r.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;
        });

});