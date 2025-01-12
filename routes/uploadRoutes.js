const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Ensure uploads directory exists
const uploadDirectory = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true }); // Create the uploads folder if it doesn't exist
}

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the folder where files will be saved
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    // Specify the name of the uploaded file (including extension)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter function to only allow image uploads
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Only images are allowed!");
  }
};

// Create a multer instance with storage and file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Set file size limit (5MB)
  fileFilter: fileFilter,
});

// Image upload API
/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload an image
 *     description: Upload an image to the server and receive the image URL.
 *     tags: [Image Upload]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: image
 *         in: formData
 *         description: The image file to be uploaded
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image uploaded successfully!"
 *                 filename:
 *                   type: string
 *                   example: "1734596260039.png"
 *                 file:
 *                   type: string
 *                   example: "/path/routes/uploads/1734596260039.png"
 *                 url:
 *                   type: string
 *                   example: "http://localhost:3000/uploads/1734596260039.png"
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No file uploaded!"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error uploading file"
 */

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded!" });
  }
  const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
//   const imageUrl = `https://node-q31r.onrender.com/uploads/${req.file.filename}`;


  // Respond with the file information
  res.status(200).json({
    message: "Image uploaded successfully!",
    filename: req.file.filename,
    file: req.file.path,
    url: imageUrl,
  });
});

module.exports = router;
