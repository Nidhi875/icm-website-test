const express = require("express");
const router = express.Router();
const pool = require("../config/db");


/* ==========================================================
   GET MESSAGE ANALYTICS
========================================================== */

router.get("/analytics", async (req, res) => {

    try {

        /* ======================================================
           MESSAGES TODAY + YESTERDAY
        ====================================================== */

        const messageStats = await pool.query(`
            SELECT
                COUNT(*) FILTER (
                    WHERE created_at >= CURRENT_DATE
                    AND created_at < CURRENT_DATE + INTERVAL '1 day'
                ) AS messages_today,

                COUNT(*) FILTER (
                    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
                    AND created_at < CURRENT_DATE
                ) AS messages_yesterday

            FROM messages
        `);


        const messagesToday =
            Number(
                messageStats.rows[0].messages_today
            );

        const messagesYesterday =
            Number(
                messageStats.rows[0].messages_yesterday
            );


        /* ======================================================
           MESSAGE CHANGE
        ====================================================== */

        let messageChange = 0;

        if (messagesYesterday > 0) {

            messageChange = Math.round(
                (
                    (
                        messagesToday -
                        messagesYesterday
                    ) /
                    messagesYesterday
                ) * 100
            );

        }


        /* ======================================================
           AVERAGE RESPONSE TIME
           
           We calculate the time between consecutive messages
           from different senders within the same conversation.
        ====================================================== */

        const responseStats = await pool.query(`

            WITH ordered_messages AS (

                SELECT
                    conversation_id,
                    sender_id,
                    created_at,

                    LAG(sender_id) OVER (
                        PARTITION BY conversation_id
                        ORDER BY created_at
                    ) AS previous_sender_id,

                    LAG(created_at) OVER (
                        PARTITION BY conversation_id
                        ORDER BY created_at
                    ) AS previous_created_at

                FROM messages

                WHERE conversation_id IS NOT NULL

            ),

            response_times AS (

                SELECT
                    EXTRACT(
                        EPOCH FROM (
                            created_at -
                            previous_created_at
                        )
                    ) / 60 AS response_minutes

                FROM ordered_messages

                WHERE
                    previous_created_at IS NOT NULL
                    AND previous_sender_id IS DISTINCT FROM sender_id

                    /* Ignore extremely long gaps */
                    AND created_at - previous_created_at
                        <= INTERVAL '24 hours'

            )

            SELECT
                ROUND(
                    AVG(response_minutes)::numeric,
                    1
                ) AS average_response_minutes

            FROM response_times

        `);


        const averageResponse =
            responseStats.rows[0]
                .average_response_minutes !== null
                ? Number(
                    responseStats.rows[0]
                        .average_response_minutes
                )
                : null;


        /* ======================================================
           RESPONSE PERFORMANCE LABEL
        ====================================================== */

        let responseStatus =
            "No response data";


        if (averageResponse !== null) {

            if (averageResponse <= 5) {

                responseStatus =
                    "Excellent Performance";

            } else if (averageResponse <= 15) {

                responseStatus =
                    "Good Performance";

            } else if (averageResponse <= 30) {

                responseStatus =
                    "Average Performance";

            } else {

                responseStatus =
                    "Needs Improvement";

            }

        }


        /* ======================================================
           DEPARTMENT ACTIVITY
           
           IMPORTANT:
           Your current messages table does NOT contain a
           department field.

           Therefore we do not fake a department percentage.
        ====================================================== */

        const departmentActivity = null;
        const leadingDepartment = null;


        /* ======================================================
           RESPONSE
        ====================================================== */

        res.json({

            success: true,

            analytics: {

                messagesToday,

                messagesYesterday,

                messageChange,

                averageResponseMinutes:
                    averageResponse,

                responseStatus,

                departmentActivity,

                leadingDepartment

            }

        });


    } catch (error) {

        console.error(
            "MESSAGE ANALYTICS ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load message analytics"

        });

    }

});


/* ==========================================================
   GET MESSAGES
========================================================== */

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`

            SELECT
                id,
                sender_id,
                sender_name,
                sender_role,
                recipient_id,
                conversation_id,
                message_text,
                message_type,
                is_read,
                created_at

            FROM messages

            ORDER BY created_at DESC

            LIMIT 500

        `);


        res.json({

            success: true,

            messages: result.rows

        });


    } catch (error) {

        console.error(
            "GET MESSAGES ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load messages"

        });

    }

});


/* ==========================================================
   SEND MESSAGE
========================================================== */

router.post("/", async (req, res) => {

    try {

        const {
            senderId,
            senderName,
            senderRole,
            recipientId,
            conversationId,
            messageText,
            messageType
        } = req.body;


        if (!senderName || !messageText) {

            return res.status(400).json({

                success: false,

                message:
                    "Sender name and message are required"

            });

        }


        const result = await pool.query(`

            INSERT INTO messages
            (
                sender_id,
                sender_name,
                sender_role,
                recipient_id,
                conversation_id,
                message_text,
                message_type
            )

            VALUES ($1,$2,$3,$4,$5,$6,$7)

            RETURNING *

        `, [

            senderId || null,

            senderName,

            senderRole || null,

            recipientId || null,

            conversationId || null,

            messageText,

            messageType || "text"

        ]);


        res.status(201).json({

            success: true,

            message:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "SEND MESSAGE ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to send message"

        });

    }

});


module.exports = router;