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