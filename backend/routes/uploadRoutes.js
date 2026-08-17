const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/", (req, res) => {
    console.log("Upload request received");

    upload.single("file")(req, res, function (err) {

        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        console.log("req.file =", req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No file uploaded"
            });
        }

        res.json({
            success: true,
            url: req.file.path
        });

    });
});

module.exports = router;