const { google } = require("googleapis");

const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const googleOAuth = require("../config/googleOAuth");
const pool = require("../config/db");


// ==================================================
// START GOOGLE CONNECTION
// ==================================================

router.get("/auth", (req, res) => {

    try {

        const token =
            req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        const user =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Only administrators can connect
        // Google Calendar for now.

        if (user.role !== "Administrator") {

            return res.status(403).json({
                success: false,
                message:
                    "Only administrators can connect Google Calendar."
            });

        }


        /*
         * State remembers WHICH staff member
         * started the Google connection.
         */

        const state =
            jwt.sign(
                {
                    staffId: user.id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "10m"
                }
            );


        const authUrl =
            googleOAuth.generateAuthUrl({

                access_type: "offline",

                prompt: "consent",

                scope: [
                    "https://www.googleapis.com/auth/calendar.events"
                ],

                state: state
            });


        res.json({
            success: true,
            authUrl: authUrl
        });

    }
    catch (error) {

        console.error(
            "GOOGLE AUTH START ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to start Google connection."
        });

    }

});


// ==================================================
// CREATE GOOGLE MEET
// ==================================================

router.post("/create-meet", async (req, res) => {

    try {

        // ------------------------------------------
        // GET LMS LOGIN TOKEN
        // ------------------------------------------

        const token =
            req.headers.authorization?.replace("Bearer ", "");

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });

        }


        // ------------------------------------------
        // VERIFY LMS USER
        // ------------------------------------------

        const user =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ------------------------------------------
        // ONLY ADMINISTRATORS FOR NOW
        // ------------------------------------------

        if (user.role !== "Administrator") {

            return res.status(403).json({
                success: false,
                message:
                    "Only administrators can create Google Meet meetings."
            });

        }


        // ------------------------------------------
        // GET MEETING INFORMATION
        // ------------------------------------------

        const {
            title,
            date,
            time,
            duration
        } = req.body;


        if (!title || !date || !time) {

            return res.status(400).json({
                success: false,
                message:
                    "Meeting title, date and time are required."
            });

        }


        // ------------------------------------------
        // GET SAVED GOOGLE CONNECTION
        // ------------------------------------------

        const result = await pool.query(
            `
            SELECT
                google_email,
                refresh_token
            FROM staff_google_tokens
            WHERE staff_id = $1
            `,
            [user.id]
        );


        if (result.rows.length === 0) {

            return res.status(400).json({
                success: false,
                message:
                    "Google Calendar is not connected for this staff member."
            });

        }


        const googleConnection =
            result.rows[0];


        // ------------------------------------------
        // CONNECT GOOGLE OAUTH
        // ------------------------------------------

        googleOAuth.setCredentials({

            refresh_token:
                googleConnection.refresh_token

        });


        // ------------------------------------------
        // CREATE GOOGLE CALENDAR CLIENT
        // ------------------------------------------

        const calendar =
            google.calendar({

                version: "v3",

                auth: googleOAuth

            });


        // ------------------------------------------
        // CALCULATE END TIME
        // ------------------------------------------

        const startDateTime =
            new Date(`${date}T${time}:00`);

        const meetingDuration =
            parseInt(duration) || 60;

        const endDateTime =
            new Date(
                startDateTime.getTime() +
                meetingDuration * 60 * 1000
            );


        // ------------------------------------------
        // CREATE CALENDAR EVENT + GOOGLE MEET
        // ------------------------------------------

        const event =
            await calendar.events.insert({

                calendarId: "primary",

                conferenceDataVersion: 1,

                requestBody: {

                    summary: title,

                    start: {

                        dateTime:
                            startDateTime.toISOString(),

                        timeZone:
                            "Asia/Kolkata"

                    },

                    end: {

                        dateTime:
                            endDateTime.toISOString(),

                        timeZone:
                            "Asia/Kolkata"

                    },

                    conferenceData: {

                        createRequest: {

                            requestId:
                                `gouldings-${Date.now()}`,

                            conferenceSolutionKey: {

                                type:
                                    "hangoutsMeet"

                            }

                        }

                    }

                }

            });


        // ------------------------------------------
        // FIND GOOGLE MEET URL
        // ------------------------------------------

        const entryPoints =
            event.data.conferenceData?.entryPoints || [];

        const videoEntry =
            entryPoints.find(
                entry =>
                    entry.entryPointType === "video"
            );


        const meetUrl =
            videoEntry?.uri || null;


        if (!meetUrl) {

            return res.status(202).json({

                success: false,

                pending: true,

                message:
                    "Google Meet is still being created. Please try again shortly."

            });

        }


        // ------------------------------------------
        // SUCCESS
        // ------------------------------------------

        console.log(
            "GOOGLE MEET CREATED:",
            meetUrl
        );


        res.json({

            success: true,

            meetUrl: meetUrl,

            googleEventId:
                event.data.id

        });

    }

    catch (error) {

        console.error(
            "GOOGLE MEET CREATION ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to create Google Meet."

        });

    }

});

// ==================================================
// GOOGLE CALLBACK
// ==================================================

router.get("/callback", async (req, res) => {

    try {

        const { code, state } = req.query;


        if (!code || !state) {

            return res.status(400).send(
                "Google authorization was incomplete."
            );

        }


        const decodedState =
            jwt.verify(
                state,
                process.env.JWT_SECRET
            );


        const staffId =
            decodedState.staffId;


        /*
         * Exchange Google's temporary authorization
         * code for access + refresh tokens.
         */

        const { tokens } =
            await googleOAuth.getToken(code);


       googleOAuth.setCredentials(tokens);


// ==================================================
// SAVE GOOGLE REFRESH TOKEN
// ==================================================

if (!tokens.refresh_token) {

    return res.status(400).send(
        "Google did not provide a refresh token. Please disconnect the Google account and try again."
    );
}

await pool.query(
    `
    INSERT INTO staff_google_tokens
    (
        staff_id,
        google_email,
        refresh_token,
        updated_at
    )
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)

    ON CONFLICT (staff_id)

    DO UPDATE SET
        google_email = EXCLUDED.google_email,
        refresh_token = EXCLUDED.refresh_token,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
        staffId,
        null,
        tokens.refresh_token
    ]
);


console.log(
    "GOOGLE TOKENS SAVED FOR STAFF:",
    staffId
);


res.send(`
    <h2>Google Calendar Connected</h2>
    <p>You can close this window and return to Gouldings Staff LMS.</p>
`);

    }
    catch (error) {

        console.error(
            "GOOGLE CALLBACK ERROR:",
            error
        );

        res.status(500).send(
            "Google authorization failed."
        );

    }

});


module.exports = router;