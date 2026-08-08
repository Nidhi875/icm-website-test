const PROFILE_PHOTO_KEY = "staffProfilePhoto";

function initProfilePhotoUpload() {

    const sidebarImg = document.getElementById("sidebarProfilePic");
    const headerImg = document.getElementById("headerProfilePic");
    const profileImg = document.getElementById("profilePreview");
    const input = document.getElementById("profilePicUpload");

    if (!input) return;

    const savedPhoto = localStorage.getItem(PROFILE_PHOTO_KEY);

    if(savedPhoto){

        if(sidebarImg) sidebarImg.src = savedPhoto;
        if(headerImg) headerImg.src = savedPhoto;
        if(profileImg) profileImg.src = savedPhoto;

    }

    input.addEventListener("change",(e)=>{

        const file = e.target.files[0];

        if(!file) return;

        const reader = new FileReader();

        reader.onload=function(event){

            const image = event.target.result;

            localStorage.setItem(PROFILE_PHOTO_KEY,image);

            if(sidebarImg) sidebarImg.src=image;
            if(headerImg) headerImg.src=image;
            if(profileImg) profileImg.src=image;

        }

        reader.readAsDataURL(file);

    });

}