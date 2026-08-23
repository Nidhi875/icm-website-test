const express = require("express");
const router = express.Router();
const pool = require("../config/db");

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
            LIMIT 100
        `);

        res.json({
            success: true,
            messages: result.rows
        });

    } catch (error) {

        console.error("GET MESSAGES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load messages"
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
                message: "Sender name and message are required"
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
            message: result.rows[0]
        });

    } catch (error) {

        console.error("SEND MESSAGE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send message"
        });

    }

});


module.exports = router;