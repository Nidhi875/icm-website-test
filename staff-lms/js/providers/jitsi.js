/*==========================================
JITSI PROVIDER
==========================================*/

function loadJitsiMeeting(meeting){

    const domain="meet.jit.si";

    const options={

        roomName:"Gouldings-"+meeting.id,

        width:"100%",

        height:"100%",

        parentNode:document.querySelector("#jitsi-container"),

        userInfo:{

            displayName:meeting.tutor

        }

    };

    new JitsiMeetExternalAPI(domain,options);

}