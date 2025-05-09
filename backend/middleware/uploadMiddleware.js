const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer with memory storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;


// file uploads (like images), handling storage and validation of uploaded files.
// This middleware can be used in routes to handle file uploads, ensuring that only valid files are processed.
// The code uses multer for handling multipart/form-data, which is primarily used for uploading files.
// The file filter checks the MIME type of the uploaded file to ensure it is an image.