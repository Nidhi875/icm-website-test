const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const {
            name,
            email,
            learnerNumber,
            country,
            subject,
            message
        } = req.body;

        // Validate required fields
        if (!name || !email || !country || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please complete all required fields."
            });
        }

        // Send email through Resend
        const resendResponse = await fetch(
            "https://api.resend.com/emails",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: "Gouldings Website <support@gouldings.education>",
                    to: ["Admin@gouldings.education"],
                    reply_to: email,
                    subject: `Website Contact: ${subject}`,
                    html: `
                        <h2>New Contact Form Submission</h2>

                        <p><strong>Name:</strong> ${name}</p>

                        <p><strong>Email:</strong> ${email}</p>

                        <p><strong>Learner Number:</strong> ${
                            learnerNumber || "Not provided"
                        }</p>

                        <p><strong>Country:</strong> ${country}</p>

                        <p><strong>Subject:</strong> ${subject}</p>

                        <hr>

                        <p><strong>Message:</strong></p>

                        <p>${message}</p>
                    `
                })
            }
        );

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
            console.error("RESEND ERROR:", resendData);

            return res.status(500).json({
                success: false,
                message: "Unable to send your message."
            });
        }

        console.log(
            "CONTACT EMAIL SENT:",
            resendData
        );

        return res.json({
            success: true,
            message: "Your message has been sent successfully."
        });

    } catch (error) {

        console.error(
            "CONTACT ROUTE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to send your message."
        });
    }
});

module.exports = router;