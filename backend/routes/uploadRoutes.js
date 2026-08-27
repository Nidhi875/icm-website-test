const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");


/* ==========================================================
   UPLOAD FILE
========================================================== */

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


/* ==========================================================
   GET SHARED FILES
========================================================== */

router.get("/", async (req, res) => {

    try {

        const result = await cloudinary.api.resources({
            type: "upload",
            prefix: "staff-messages/",
            max_results: 20
        });

        const files = result.resources.map(file => ({

            name: file.original_filename
                ? `${file.original_filename}${file.format ? "." + file.format : ""}`
                : file.public_id.split("/").pop(),

            url: file.secure_url,

            size: file.bytes,

            format: file.format,

            created_at: file.created_at

        }));


        // Newest files first
        files.sort(
            (a, b) =>
                new Date(b.created_at) -
                new Date(a.created_at)
        );


        res.json({

            success: true,

            files: files.slice(0, 3)

        });

    } catch (error) {

        console.error(
            "GET SHARED FILES ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to load shared files"

        });

    }

});


module.exports = router;