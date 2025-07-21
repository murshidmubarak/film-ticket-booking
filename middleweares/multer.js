
const multer = require('multer');
const path = require('path'); // Mandatory: For file extension
const fs = require('fs'); // Mandatory: For directory check

// Set uploads folder inside public/
const uploadDir = 'public/'; // Changed to public/
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create public/uploads/ if not exist
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save files in public/uploads/ folder
    },
    filename: function (req, file, cb) {
        const namePrefix = Date.now(); // Timestamp for unique name
        const ext = path.extname(file.originalname); // Get file extension
        const newName = namePrefix + ext; // Fixed typo: namePrefixes to namePrefix
        cb(null, newName);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;