const S3rver = require("s3rver");
const { S3Client } = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const BUCKET_NAME = "media-locker";
const S3_PORT = 4568;
const S3_HOST = "localhost";

const bucketPath = path.join(__dirname, "../../s3-storage");
if (!fs.existsSync(bucketPath)) {
  fs.mkdirSync(bucketPath, { recursive: true });
}

const server = new S3rver({
  port: S3_PORT,
  host: S3_HOST,
  silent: false,
  directory: bucketPath,
  configureBuckets: [
    {
      name: BUCKET_NAME,
    },
  ],
});

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: `http://${S3_HOST}:${S3_PORT}`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: "S3RVER",
    secretAccessKey: "S3RVER",
  },
});
const generatePresignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return url;
};
module.exports = { server, s3Client, BUCKET_NAME, generatePresignedUrl };
