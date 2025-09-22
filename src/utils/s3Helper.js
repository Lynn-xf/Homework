const { uploadHomeworkImage, generatePresignedUrl, deleteHomeworkImage } = require('./setupS3');

async function uploadNoteImage(file, cognitoId) {
  if (!file || !file.data) {
    throw new Error('Invalid file object provided');
  }

  if (!cognitoId) {
    throw new Error('Cognito ID is required for file upload');
  }

  const result = await uploadHomeworkImage(file.data, file.name, cognitoId);
  
  return {
    s3Key: result.key,
    presignedUrl: result.presignedUrl,
  };
}

async function getNoteImageUrl(s3Key, expiresIn = 3600) {
  if (!s3Key) {
    throw new Error('S3 key is required');
  }

  return await generatePresignedUrl(s3Key, expiresIn);
}

async function deleteNoteImage(s3Key) {
  if (!s3Key) {
    throw new Error('S3 key is required for deletion');
  }

  await deleteHomeworkImage(s3Key);
  
  return {
    success: true,
    deletedKey: s3Key,
  };
}

function isS3Image(notePicture) {
  return notePicture && notePicture.includes('homework-images/');
}

module.exports = {
  uploadNoteImage,
  getNoteImageUrl,
  deleteNoteImage,
  isS3Image,
};