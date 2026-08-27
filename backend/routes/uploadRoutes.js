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

            console.error("UPLOAD ERROR:", err);

            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        console.log("Uploaded file:", req.file);

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        res.json({
            success: true,
            message: "File uploaded successfully",
            file: {
                name: req.file.originalname,
                url: req.file.path,
                public_id: req.file.public_id,
                resource_type: req.file.resource_type,
                format: req.file.format,
                size: req.file.bytes
            }
        });

    });

});


/* ==========================================================
   GET SHARED FILES
========================================================== */

router.get("/", async (req, res) => {

    try {

        const result =
            await cloudinary.api.resources({
                type: "upload",
                prefix: "staff-messages/",
                max_results: 100
            });


        const files = result.resources.map(file => ({

            public_id:
                file.public_id,

            name:
                file.original_filename
                    ? `${file.original_filename}${file.format ? "." + file.format : ""}`
                    : file.public_id.split("/").pop(),

            url:
                file.secure_url,

            size:
                file.bytes,

            format:
                file.format,

            resource_type:
                file.resource_type,

            created_at:
                file.created_at

        }));


        files.sort(
            (a, b) =>
                new Date(b.created_at) -
                new Date(a.created_at)
        );


        res.json({

            success: true,

            files

        });


    } catch (error) {

        console.error(
            "GET SHARED FILES ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to load shared files"

        });

    }

});


/* ==========================================================
   RENAME / EDIT FILE
========================================================== */

router.put("/:publicId(*)", async (req, res) => {

    try {

        const oldPublicId =
            req.params.publicId;

        const newName =
            String(req.body.name || "")
                .trim();


        if (!newName) {

            return res.status(400).json({

                success: false,

                message:
                    "New file name is required"

            });

        }


        /*
           Keep the file extension.
        */

        const oldFileName =
            oldPublicId.split("/").pop();

        const oldExtension =
            oldFileName.includes(".")
                ? oldFileName.substring(
                    oldFileName.lastIndexOf(".")
                )
                : "";


        let finalName =
            newName;


        if (
            oldExtension &&
            !finalName
                .toLowerCase()
                .endsWith(
                    oldExtension.toLowerCase()
                )
        ) {

            finalName += oldExtension;

        }


        /*
           Prevent unsafe Cloudinary path names.
        */

        finalName =
            finalName
                .replace(/[\/\\:*?"<>|]/g, "-")
                .trim();


        const folder =
            "staff-messages";


        const newPublicId =
            `${folder}/${finalName}`;


        const result =
            await cloudinary.uploader.rename(
                oldPublicId,
                newPublicId,
                {
                    resource_type:
                        req.body.resource_type ||
                        "image"
                }
            );


        res.json({

            success: true,

            message:
                "File renamed successfully",

            file: {

                public_id:
                    result.public_id,

                url:
                    result.secure_url

            }

        });


    } catch (error) {

        console.error(
            "RENAME FILE ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to rename file"

        });

    }

});


/* ==========================================================
   DELETE FILE
========================================================== */

router.delete("/:publicId(*)", async (req, res) => {

    try {

        const publicId =
            req.params.publicId;


        const resourceType =
            req.query.resource_type ||
            "image";


        const result =
            await cloudinary.uploader.destroy(
                publicId,
                {
                    resource_type:
                        resourceType
                }
            );


        if (
            result.result !== "ok" &&
            result.result !== "not found"
        ) {

            return res.status(500).json({

                success: false,

                message:
                    "Cloudinary could not delete the file"

            });

        }


        res.json({

            success: true,

            message:
                "File deleted successfully",

            result:
                result.result

        });


    } catch (error) {

        console.error(
            "DELETE FILE ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to delete file"

        });

    }

});


module.exports = router;