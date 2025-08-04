const express = require('express');
const app = express();
const env = require('dotenv').config();
const db = require('./config/db');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const multer = require('multer'); // Added multer

// Connect to database
db();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // Directory to save uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  }
});

const upload = multer({ storage: storage }); // Initialize multer

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true
    }
}));

app.set('view engine', 'ejs');
app.set("views", [
    path.join(__dirname, "views/user"),
    path.join(__dirname, "views/admin"),
    path.join(__dirname, "views/partials"),
]);

app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', userRoutes);
app.use('/admin', adminRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = app;