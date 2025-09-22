const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: "ap-southeast-2"
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "n11724668-homework-app";
const HOMEWORK_IMAGES_PREFIX = "homework-images/";

async function uploadHomeworkImage(fileBuffer, fileName, cognitoId) {
  const timestamp = Date.now();
  const s3Key = `${HOMEWORK_IMAGES_PREFIX}user-${cognitoId}/${timestamp}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileBuffer,
  });

  await s3Client.send(command);
  
  const presignedUrl = await generatePresignedUrl(s3Key);

  return {
    key: s3Key,
    presignedUrl: presignedUrl,
  };
}

async function generatePresignedUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

async function generatePresignedUploadUrl(fileName, userId, expiresIn = 3600) {
  const timestamp = Date.now();
  const s3Key = `${HOMEWORK_IMAGES_PREFIX}user-${userId}/${timestamp}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return {
    presignedUrl,
    s3Key,
    fileName
  };
}

async function deleteHomeworkImage(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await s3Client.send(command);
}

module.exports = {
  s3Client,
  BUCKET_NAME,
  HOMEWORK_IMAGES_PREFIX,
  uploadHomeworkImage,
  generatePresignedUrl,
  generatePresignedUploadUrl,
  deleteHomeworkImage,
};