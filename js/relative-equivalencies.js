document.querySelectorAll(".descriptor-btn").forEach(button => {

    button.addEventListener("click", function () {

        const item = this.parentElement;

        const content = item.querySelector(".descriptor-content");

        const opened = item.classList.contains("open");

        document.querySelectorAll(".descriptor").forEach(section => {

            section.classList.remove("open");

            section.querySelector(".descriptor-content").style.maxHeight = null;

        });

        if (!opened) {

            item.classList.add("open");

            content.style.maxHeight = content.scrollHeight + "px";

        }

    });

});