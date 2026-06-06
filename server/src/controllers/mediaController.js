const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client, BUCKET_NAME, generatePresignedUrl } = require("../db/s3");
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
        m.original_key,
        m.created_at,
        m.uploader_id,
        CASE WHEN u.id IS NOT NULL THEN true ELSE false END as is_unlocked,
        CASE WHEN m.uploader_id = $1 THEN true ELSE false END as is_owner
       FROM media m
       LEFT JOIN unlocks u ON u.media_id = m.id AND u.user_id = $1
       ORDER BY m.created_at DESC`,
      [userId],
    );

    const mediaWithUrls = await Promise.all(
      result.rows.map(async (item) => {
        const blurred_url = await generatePresignedUrl(item.blurred_key);
        let original_url = null;
        if (item.is_owner || item.is_unlocked) {
          original_url = await generatePresignedUrl(item.original_key);
        }
        return { ...item, blurred_url, original_url };
      }),
    );

    res.json({ media: mediaWithUrls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const unlockMedia = async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.userId;
    const mediaId = req.params.id;

    await client.query("BEGIN");

    const mediaResult = await client.query(
      "SELECT * FROM media WHERE id = $1",
      [mediaId],
    );

    if (mediaResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Media not found" });
    }

    const media = mediaResult.rows[0];

    if (media.uploader_id === userId) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "You cannot unlock your own media" });
    }

    const existingUnlock = await client.query(
      "SELECT * FROM unlocks WHERE user_id = $1 AND media_id = $2",
      [userId, mediaId],
    );

    if (existingUnlock.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Already unlocked" });
    }

    const userResult = await client.query(
      "SELECT coins FROM users WHERE id = $1",
      [userId],
    );

    if (userResult.rows[0].coins < media.unlock_price) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient coins" });
    }

    await client.query("UPDATE users SET coins = coins - $1 WHERE id = $2", [
      media.unlock_price,
      userId,
    ]);

    await client.query(
      `INSERT INTO transactions (user_id, amount, type, description)
       VALUES ($1, $2, 'debit', $3)`,
      [userId, media.unlock_price, `Unlocked media: ${media.title}`],
    );

    await client.query(
      "INSERT INTO unlocks (user_id, media_id) VALUES ($1, $2)",
      [userId, mediaId],
    );

    await client.query("COMMIT");

    res.json({ message: "Media unlocked successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};

const getMediaById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const mediaId = req.params.id;

    const mediaResult = await pool.query("SELECT * FROM media WHERE id = $1", [
      mediaId,
    ]);

    if (mediaResult.rows.length === 0) {
      return res.status(404).json({ error: "Media not found" });
    }

    const media = mediaResult.rows[0];
    const isOwner = media.uploader_id === userId;

    const unlockResult = await pool.query(
      "SELECT * FROM unlocks WHERE user_id = $1 AND media_id = $2",
      [userId, mediaId],
    );

    const isUnlocked = unlockResult.rows.length > 0;
    const blurredUrl = await generatePresignedUrl(media.blurred_key);

    let originalUrl = null;
    if (isOwner || isUnlocked) {
      originalUrl = await generatePresignedUrl(media.original_key);
    }

    res.json({
      id: media.id,
      title: media.title,
      unlock_price: media.unlock_price,
      is_unlocked: isUnlocked,
      is_owner: isOwner,
      blurred_url: blurredUrl,
      original_url: originalUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { uploadMedia, getMediaFeed, unlockMedia, getMediaById };
