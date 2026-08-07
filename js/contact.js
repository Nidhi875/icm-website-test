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

    const form = document.querySelector(".contact-form form");

    if(form){

        form.addEventListener("submit", function(e){

            e.preventDefault();

            const required = form.querySelectorAll("input[required], textarea");

            let valid = true;

            required.forEach(field=>{

                if(field.value.trim()===""){

                    field.style.borderColor="#d62828";

                    valid=false;

                }else{

                    field.style.borderColor="#d4af37";

                }

            });

            if(valid){

                alert("Thank you for contacting Gouldings Global Academy. We will respond shortly.");

                form.reset();

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