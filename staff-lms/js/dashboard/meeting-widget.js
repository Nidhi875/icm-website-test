/*==========================================
MEETING WIDGET
==========================================*/

function renderMeetings() {

    const meetingsContainer = document.getElementById("meetingsList");

    if (!meetingsContainer) return;

   const meetings = getMeetings();

const sortedMeetings = [...meetings].sort((a,b)=>{

    const statusOrder = {

        live:0,
        upcoming:1,
        completed:2

    };

    const aStatus = getMeetingStatus(a).class;
    const bStatus = getMeetingStatus(b).class;

    if(statusOrder[aStatus]!==statusOrder[bStatus]){

        return statusOrder[aStatus]-statusOrder[bStatus];

    }

    return new Date(`${a.date}T${a.time}`)-
           new Date(`${b.date}T${b.time}`);

});

meetingsContainer.innerHTML = sortedMeetings.map(meeting => `

    

<div class="meeting-card">

   <div class="meeting-left">

    <div class="meeting-video-icon">
        <i data-lucide="video"></i>
    </div>

    <div class="meeting-content">

    ${(() => {

    const status = getMeetingStatus(meeting);

    return `

        <div class="meeting-top">

            <span class="meeting-status ${status.class}">
                ${status.text}
            </span>

            <span class="meeting-platform ${meeting.badge}">
                ${meeting.platform}
            </span>

        </div>

    `;

})()}

        <h3>${meeting.title}</h3>

        <p class="meeting-tutor">${meeting.tutor}</p>

        <div class="meeting-meta">

            <span>${formatMeetingDate(meeting)}</span>
            <span>•</span>
          <span>

${new Date(`${meeting.date}T${meeting.time}`)
.toLocaleTimeString("en-US",{

hour:"numeric",

minute:"2-digit",

hour12:true

})}

</span>


            <span>•</span>
            <span>

${meeting.duration} mins

</span>
            <span>•</span>
            <span>${meeting.attendees} Attendees</span>

        </div>

    </div>

</div>

<div class="meeting-right">

    <button
        class="join-btn"
        onclick="joinMeeting(${meeting.id})">

        <i data-lucide="video"></i>

        Join

    </button>

</div>

</div>


`).join("");




if (window.lucide) {
    lucide.createIcons();
}


}

/*==========================================
JOIN MEETING
==========================================*/

function joinMeeting(id){

    window.location.href = `meeting-room.html?id=${id}`;

}