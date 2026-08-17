const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "staff-messages",
    resource_type: "auto", // allows PDF, DOCX, images, etc.
    public_id: Date.now() + "-" + file.originalname,
  }),
});

const upload = multer({ storage });

module.exports = upload;