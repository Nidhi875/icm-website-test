/*====================================================
GOULDINGS GLOBAL ACADEMY
CONTACT PAGE
====================================================*/

document.addEventListener("DOMContentLoaded", () => {

    /*=====================================
      FAQ ACCORDION
    =====================================*/

    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {

        const button = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        button.addEventListener("click", () => {

            faqItems.forEach(other => {

                if(other !== item){

                    other.classList.remove("active");

                    other.querySelector(".faq-answer").style.maxHeight = null;

                }

            });

            item.classList.toggle("active");

            if(item.classList.contains("active")){

                answer.style.maxHeight = answer.scrollHeight + "px";

            }else{

                answer.style.maxHeight = null;

            }

        });

    });



    /*=====================================
      FORM VALIDATION
    =====================================*/

 /*=====================================
  CONTACT FORM SUBMISSION
=====================================*/

const form = document.querySelector(".contact-form form");

if (form) {

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const required = form.querySelectorAll(
            "input[required], textarea"
        );

        let valid = true;

        required.forEach(field => {

            if (field.value.trim() === "") {

                field.style.borderColor = "#d62828";
                valid = false;

            } else {

                field.style.borderColor = "#d4af37";

            }

        });

        if (!valid) {
            alert("Please complete all required fields.");
            return;
        }

        const submitButton = form.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        const originalText = submitButton
            ? submitButton.textContent
            : "";

        try {

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Sending...";
            }

          const fields = form.querySelectorAll(
        "input:not([type='checkbox']), select, textarea"
                 );

               const data = {
                 email: fields[0].value.trim(),
                 name: fields[1].value.trim(),
                learnerNumber: fields[2].value.trim(),
                 country: fields[3].value.trim(),
                subject: fields[4].value.trim(),
                 message: fields[5].value.trim()
                  };
            const response = await fetch(
                  "https://icm-website-test-production.up.railway.app/api/contact",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to send message."
                );
            }

            alert(
                "Thank you for contacting Gouldings Global Academy. We will respond shortly."
            );

            form.reset();

        } catch (error) {

            console.error("CONTACT FORM ERROR:", error);

            alert(
                "Unable to send your message right now. Please try again."
            );

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }

        }

    });

}



    /*=====================================
      SCROLL REVEAL
    =====================================*/

    const observer = new IntersectionObserver((entries)=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.classList.add("show");

            }

        });

    },{

        threshold:0.15

    });

    document.querySelectorAll(

        ".contact-card,.info-box,.contact-map,.contact-faq,.contact-cta,.contact-form"

    ).forEach(el=>observer.observe(el));



    /*=====================================
      SMOOTH SCROLL
    =====================================*/

    document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

        anchor.addEventListener("click",function(e){

            e.preventDefault();

            const target=document.querySelector(this.getAttribute("href"));

            if(target){

                target.scrollIntoView({

                    behavior:"smooth"

                });

            }

        });

    });

});