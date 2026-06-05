const express = require("express");
const router = express.Router();
const multer = require("multer");
const authenticate = require("../middleware/auth");
const { uploadMedia, getMediaFeed } = require("../controllers/mediaController");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", authenticate, getMediaFeed);
router.post("/upload", authenticate, upload.single("image"), uploadMedia);

module.exports = router;
