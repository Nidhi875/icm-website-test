function loadZoomMeeting(meeting){

    document.getElementById("jitsi-container").innerHTML = `

        <div class="provider-placeholder">

            <h2>Zoom Meeting</h2>

            <p>
                Zoom SDK will load here.
            </p>

        </div>

    `;

}


/*==========================================
ZOOM PROVIDER
==========================================*/

function loadZoomMeeting(meeting){

    document.getElementById("jitsi-container").innerHTML = `

        <div class="provider-placeholder">

            <i class="fa-solid fa-video"></i>

            <h2>Zoom Meeting SDK</h2>

            <p>

                Preparing secure Zoom meeting...

            </p>

        </div>

    `;

    // Zoom SDK initialization will go here

}