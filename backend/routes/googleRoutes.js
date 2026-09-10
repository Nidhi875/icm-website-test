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
                    "https://www.googleapis.com/auth/calendar.events",
                    "https://www.googleapis.com/auth/gmail.readonly"
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
// START GMAIL CONNECTION
// ==================================================

router.get("/gmail/auth", (req, res) => {

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
        // STATE REMEMBERS STAFF MEMBER
        // ------------------------------------------

        const state =
            jwt.sign(
                {
                    staffId: user.id,
                    purpose: "gmail"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "10m"
                }
            );


        // ------------------------------------------
        // CREATE GOOGLE AUTHORIZATION URL
        // ------------------------------------------

        const authUrl =
            googleOAuth.generateAuthUrl({

                access_type: "offline",

                prompt: "consent",

                scope: [
                       "https://www.googleapis.com/auth/calendar.events",
                    "https://www.googleapis.com/auth/gmail.readonly"
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
            "GMAIL AUTH START ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to start Gmail connection."
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

// ==================================================
// GET GOOGLE ACCOUNT EMAIL
// ==================================================

let googleEmail = null;

if (decodedState.purpose === "gmail") {

    try {

        const gmail =
            google.gmail({
                version: "v1",
                auth: googleOAuth
            });

        const profile =
            await gmail.users.getProfile({
                userId: "me"
            });

        googleEmail =
            profile.data.emailAddress || null;

    }

    catch (emailError) {

        console.error(
            "GOOGLE EMAIL FETCH ERROR:",
            emailError
        );

    }

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
        googleEmail,
        tokens.refresh_token
    ]
);


console.log(
    "GOOGLE TOKENS SAVED FOR STAFF:",
    staffId
);


const connectionType =
    decodedState.purpose === "gmail"
        ? "Gmail"
        : "Google Calendar";

res.send(`
    <h2>Google ${connectionType} Connected</h2>
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


// ============================================================
// GMAIL INTEGRATION
// ============================================================

// Get Gmail client for the currently logged-in staff member
async function getGmailClient(staffId) {

    const result = await pool.query(
        `SELECT refresh_token
         FROM staff_google_tokens
         WHERE staff_id = $1`,
        [staffId]
    );

    if (result.rows.length === 0 || !result.rows[0].refresh_token) {
        throw new Error("GOOGLE_ACCOUNT_NOT_CONNECTED");
    }

    const refreshToken = result.rows[0].refresh_token;

    // Create a NEW OAuth client for this request.
    // This keeps one staff member's Google credentials
    // isolated from another staff member's credentials.
    const oauthClient = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauthClient.setCredentials({
        refresh_token: refreshToken
    });

    return google.gmail({
        version: "v1",
        auth: oauthClient
    });
}


// ============================================================
// GMAIL CONNECTION STATUS
// ============================================================

router.get("/gmail/status", async (req, res) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const result = await pool.query(
            `SELECT google_email
             FROM staff_google_tokens
             WHERE staff_id = $1`,
            [decoded.id]
        );

        if (result.rows.length === 0) {

            return res.json({
                success: true,
                connected: false,
                email: null
            });

        }

        return res.json({
            success: true,
            connected: true,
            email: result.rows[0].google_email || null
        });

    } catch (error) {

        console.error(
            "GMAIL STATUS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to check Gmail connection"
        });
    }
});


// ============================================================
// GMAIL UNREAD COUNT
// ============================================================

router.get("/gmail/unread-count", async (req, res) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const gmail = await getGmailClient(decoded.id);

        const result = await gmail.users.labels.get({
            userId: "me",
            id: "INBOX"
        });

        const unreadCount =
            result.data.messagesUnread || 0;

        const totalMessages =
            result.data.messagesTotal || 0;

        return res.json({
            success: true,
            unreadCount,
            totalMessages
        });

    } catch (error) {

        console.error(
            "GMAIL UNREAD COUNT ERROR:",
            error
        );

        if (error.message === "GOOGLE_ACCOUNT_NOT_CONNECTED") {

            return res.status(404).json({
                success: false,
                connected: false,
                message: "Google account is not connected"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to fetch Gmail unread count"
        });
    }
});


// ============================================================
// GMAIL INBOX
// ============================================================

router.get("/gmail/inbox", async (req, res) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const gmail = await getGmailClient(decoded.id);

        const listResult =
            await gmail.users.messages.list({
                userId: "me",
                labelIds: ["INBOX"],
                maxResults: 20
            });

        const messageList =
            listResult.data.messages || [];

        const messages = await Promise.all(

            messageList.map(async (message) => {

                const result =
                    await gmail.users.messages.get({
                        userId: "me",
                        id: message.id,
                        format: "metadata",
                        metadataHeaders: [
                            "From",
                            "To",
                            "Subject",
                            "Date"
                        ]
                    });

                const headers =
                    result.data.payload?.headers || [];

                const getHeader = (name) => {

                    const header = headers.find(
                        h =>
                            h.name.toLowerCase() ===
                            name.toLowerCase()
                    );

                    return header
                        ? header.value
                        : "";
                };

                const labels =
                    result.data.labelIds || [];

                return {

                    id: result.data.id,

                    threadId:
                        result.data.threadId,

                    from:
                        getHeader("From"),

                    to:
                        getHeader("To"),

                    subject:
                        getHeader("Subject"),

                    date:
                        getHeader("Date"),

                    snippet:
                        result.data.snippet || "",

                    unread:
                        labels.includes("UNREAD")
                };

            })

        );

        return res.json({
            success: true,
            messages
        });

    } catch (error) {

        console.error(
            "GMAIL INBOX ERROR:",
            error
        );

        if (error.message === "GOOGLE_ACCOUNT_NOT_CONNECTED") {

            return res.status(404).json({
                success: false,
                connected: false,
                message: "Google account is not connected"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to fetch Gmail inbox"
        });
    }
});


// ============================================================
// GET INDIVIDUAL GMAIL MESSAGE
// ============================================================

router.get("/gmail/message/:id", async (req, res) => {

    try {

        // ------------------------------------------
        // GET LMS LOGIN TOKEN
        // ------------------------------------------

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required"
            });
        }

        const token = authHeader.split(" ")[1];

        // ------------------------------------------
        // VERIFY LMS USER
        // ------------------------------------------

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ------------------------------------------
        // GET GMAIL CLIENT FOR THIS STAFF MEMBER
        // ------------------------------------------

        const gmail = await getGmailClient(decoded.id);

        // ------------------------------------------
        // GET MESSAGE
        // ------------------------------------------

        const result =
            await gmail.users.messages.get({
                userId: "me",
                id: req.params.id,
                format: "full"
            });

        const message = result.data;

        // ------------------------------------------
        // READ EMAIL HEADERS
        // ------------------------------------------

        const headers =
            message.payload?.headers || [];

        const getHeader = (name) => {

            const header = headers.find(
                h =>
                    h.name.toLowerCase() ===
                    name.toLowerCase()
            );

            return header
                ? header.value
                : "";
        };

        // ------------------------------------------
        // DECODE GMAIL BODY
        // ------------------------------------------

        const decodeBody = (data) => {

            if (!data) {
                return "";
            }

            return Buffer
                .from(
                    data
                        .replace(/-/g, "+")
                        .replace(/_/g, "/"),
                    "base64"
                )
                .toString("utf-8");
        };

        // ------------------------------------------
        // FIND EMAIL BODY
        // ------------------------------------------

        let textBody = "";
        let htmlBody = "";

        const extractParts = (part) => {

            if (!part) {
                return;
            }

            if (
                part.mimeType === "text/plain" &&
                part.body?.data
            ) {
                textBody = decodeBody(
                    part.body.data
                );
            }

            if (
                part.mimeType === "text/html" &&
                part.body?.data
            ) {
                htmlBody = decodeBody(
                    part.body.data
                );
            }

            if (part.parts) {

                part.parts.forEach(
                    extractParts
                );

            }
        };

        extractParts(message.payload);

        // ------------------------------------------
        // RETURN EMAIL
        // ------------------------------------------

        return res.json({

            success: true,

            message: {

                id:
                    message.id,

                threadId:
                    message.threadId,

                from:
                    getHeader("From"),

                to:
                    getHeader("To"),

                cc:
                    getHeader("Cc"),

                bcc:
                    getHeader("Bcc"),

                subject:
                    getHeader("Subject"),

                date:
                    getHeader("Date"),

                snippet:
                    message.snippet || "",

                unread:
                    (message.labelIds || [])
                        .includes("UNREAD"),

                textBody,

                htmlBody
            }

        });

    } catch (error) {

        console.error(
            "GMAIL MESSAGE ERROR:",
            error
        );

        if (
            error.message ===
            "GOOGLE_ACCOUNT_NOT_CONNECTED"
        ) {

            return res.status(404).json({
                success: false,
                connected: false,
                message:
                    "Google account is not connected"
            });

        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch Gmail message"
        });

    }

});


module.exports = router;