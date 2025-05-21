const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


// // // TEMP DEBUG (remove after working)
// // console.log("Cloudinary ENV:", {
// //     name: process.env.CLOUD_NAME,
// //     key: process.env.CLOUD_API_KEY,
// //     secret: process.env.CLOUD_API_SECRET
// // });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'WanderDest_dev',
        allowedFormats: ["png", "jpg", "jpeg"],
    },
});

module.exports = {
    cloudinary,
    storage
}