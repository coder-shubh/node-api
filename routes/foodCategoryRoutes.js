const express = require("express");
const FoodCategory = require("../models/foodCategorySchema");
const router = express.Router();
const verifyToken = require("./Authorization/verifyToken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


const uploadDirectory = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
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

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter,
});

/**
 * @swagger
 * /api/foodCategory:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new category with the specified name and image.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *               - categoryImage
 *             properties:
 *               categoryName:
 *                 type: string
 *                 description: The name of the category
 *               categoryImage:
 *                 type: string
 *                 format: binary
 *                 description: The image of the category
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *                 savedCategory:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Category already exists or bad request
 *       500:
 *         description: Server error
 */

router.post(
  "/foodCategory",
  verifyToken,
  upload.single("categoryImage"),
  async (req, res) => {
    const { categoryName } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const existingCategory = await FoodCategory.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const newCategory = new FoodCategory({
      categoryName,
      categoryImage: req.file.filename,
    });

    try {
      const savedCategory = await newCategory.save();
      res
        .status(201)
        .json({ message: "Category created successfully", savedCategory });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/foodCategory:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all categories with pagination.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of categories per page.
 *     responses:
 *       200:
 *         description: A list of categories with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalCategories:
 *                       type: integer
 *                       example: 50
 *       500:
 *         description: Internal server error
 */

router.get("/foodCategory", verifyToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const skip = (page - 1) * limit;
    const categories = await FoodCategory.find().skip(skip).limit(limit);
    const totalCategory = await FoodCategory.countDocuments();

    res.status(200).json({
      categories: categories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCategory / limit),
        totalCategory: totalCategory,
      },
    });
  } catch (error) {
    res.status(400).json({ error: "Failed to fetch categories" });
  }
});

module.exports = router;
