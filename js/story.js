const storyBlocks =
document.querySelectorAll(".story-block");

const storyImages =
document.querySelectorAll(".story-image");

function changeStoryImage(){

    storyBlocks.forEach(block=>{

        const rect =
        block.getBoundingClientRect();

        if(
            rect.top <= window.innerHeight*0.45 &&
            rect.bottom >= window.innerHeight*0.45
        ){

            const imageId =
            block.dataset.image;

            storyImages.forEach(img=>{
                img.classList.remove(
                    "active"
                );
            });

            const activeImage =
            document.getElementById(
                imageId
            );

            if(activeImage){
                activeImage.classList.add(
                    "active"
                );
            }

        }

    });

}

window.addEventListener(
    "scroll",
    changeStoryImage
);

changeStoryImage();