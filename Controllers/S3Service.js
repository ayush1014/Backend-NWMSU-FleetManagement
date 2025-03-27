require('dotenv').config();
const { S3Client, PutObjectAclCommand } = require("@aws-sdk/client-s3");
const multer = require('multer');
const multerS3 = require('multer-s3');

// Initialize S3 Client for AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Function to set ACL of S3 object to public-read
async function makePublicRead(bucketName, objectKey) {
  const aclParams = {
    Bucket: bucketName,
    Key: objectKey,
    ACL: "public-read"
  };

  try {
    await s3Client.send(new PutObjectAclCommand(aclParams));
    console.log(`ACL set to public-read for ${objectKey}`);
  } catch (err) {
    console.error("Error setting ACL", err);
  }
}

// Multer S3 configuration
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read', 
    key: function (req, file, cb) {
      const key = `uploads/${Date.now().toString()}-${file.originalname}`;
      cb(null, key);
    }
  })
});

module.exports = {upload,makePublicRead};