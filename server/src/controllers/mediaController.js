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

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: originalKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: blurredKey,
        Body: blurredBuffer,
        ContentType: file.mimetype,
      }),
    );

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
const getMediaFeed = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT 
        m.id,
        m.title,
        m.unlock_price,
        m.blurred_key,
        m.created_at,
        m.uploader_id,
        CASE WHEN u.id IS NOT NULL THEN true ELSE false END as is_unlocked,
        CASE WHEN m.uploader_id = $1 THEN true ELSE false END as is_owner
       FROM media m
       LEFT JOIN unlocks u ON u.media_id = m.id AND u.user_id = $1
       ORDER BY m.created_at DESC`,
      [userId],
    );

    res.json({ media: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = { uploadMedia, getMediaFeed };
