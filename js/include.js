console.log("include.js loaded");

document.addEventListener("DOMContentLoaded", () => {

    // NAVBAR
    fetch("components/navbar.html")
        .then(r => r.text())
        .then(data => {

            const navbar =
                document.getElementById("navbar");

            if (navbar) {
                navbar.innerHTML = data;
            }
        });


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
        });

    }


    // FOOTER
    const footer =
        document.getElementById("footer");

    if (footer) {

        fetch("components/footer.html")
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