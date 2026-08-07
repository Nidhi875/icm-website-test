/*==========================================
MEETING STORAGE
==========================================*/

const MEETING_KEY = "gouldings_meetings";

/*------------------------------------------
FIRST RUN
------------------------------------------*/

function initialiseMeetingStorage(){

    if(localStorage.getItem(MEETING_KEY)) return;

    localStorage.setItem(

        MEETING_KEY,

        JSON.stringify(meetingsData)

    );

}

/*------------------------------------------
GET
------------------------------------------*/

function getMeetings(){

    return JSON.parse(

        localStorage.getItem(MEETING_KEY)

    ) || [];

}

/*------------------------------------------
SAVE
------------------------------------------*/

function saveMeetings(data){

    localStorage.setItem(

        MEETING_KEY,

        JSON.stringify(data)

    );

}