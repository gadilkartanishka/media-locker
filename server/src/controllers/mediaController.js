const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client, BUCKET_NAME } = require("../db/s3");
const pool = require("../db");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const uploadMedia = async (req, res) => {
  try {
    const { title, unlock_price } = req.body;
    const uploaderId = req.user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalKey = `originals/${uuidv4()}-${file.originalname}`;
    const blurredKey = `blurred/${uuidv4()}-${file.originalname}`;

    const blurredBuffer = await sharp(file.buffer).blur(20).toBuffer();

    // Upload original to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: originalKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // Upload blurred to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: blurredKey,
        Body: blurredBuffer,
        ContentType: file.mimetype,
      }),
    );

    // Save media record to database
    const result = await pool.query(
      `INSERT INTO media (uploader_id, title, unlock_price, original_key, blurred_key)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [uploaderId, title, unlock_price, originalKey, blurredKey],
    );

    res.status(201).json({ media: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { uploadMedia };
