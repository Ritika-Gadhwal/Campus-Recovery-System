const cloudinary = require('cloudinary').v2;

// Check if credentials exist
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary successfully configured');
} else {
  console.log('Cloudinary not configured. Defaulting to local public uploads.');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured
};
