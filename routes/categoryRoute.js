const express = require("express");
const Category = require("../models/categorySchema");
const router = express.Router();
const verifyToken = require("./Authorization/verifyToken");
const js2xmlparser = require("js2xmlparser");
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
 * /api/category:
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
  "/category",
  verifyToken,
  upload.single("categoryImage"),
  async (req, res) => {
    const { categoryName } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const newCategory = new Category({
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
 * /api/category:
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

router.get("/category", verifyToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const skip = (page - 1) * limit;
    const categories = await Category.find().skip(skip).limit(limit);
    const totalCategory = await Category.countDocuments();

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

/**
 * @swagger
 * /api/categoryXmlResponse:
 *   get:
 *     summary: Get a list of categories with pagination in XML format
 *     description: Returns a paginated list of categories in XML format with pagination details.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: query
 *         name: page
 *         description: The page number for pagination (default is 1)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: The number of categories per page (default is 10)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of categories in XML format with pagination information
 *         content:
 *           application/xml:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoryName:
 *                             type: string
 *                           _id:
 *                             type: string
 *                             description: Category's unique identifier
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalCategory:
 *                           type: integer
 *             example:
 *               <?xml version="1.0" encoding="UTF-8"?>
 *               <response>
 *                 <categories>
 *                   <category>
 *                     <categoryName>SmartPhone</categoryName>
 *                     <id>67613a005255acf916034576</id>
 *                   </category>
 *                   <category>
 *                     <categoryName>Clothing and Apparel</categoryName>
 *                     <id>67614f13cf175fc88a6280ef</id>
 *                   </category>
 *                 </categories>
 *                 <pagination>
 *                   <currentPage>1</currentPage>
 *                   <totalPages>10</totalPages>
 *                   <totalCategory>100</totalCategory>
 *                 </pagination>
 *               </response>
 *       400:
 *         description: Failed to fetch categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating failure
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: "Unauthorized access"
 *       content:
 *         "application/json":
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Unauthorized"
 *     NotFoundError:
 *       description: "Resource not found"
 *       content:
 *         "application/json":
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Resource not found"
 */

router.get("/categoryXmlResponse", verifyToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const skip = (page - 1) * limit;

    // Use .lean() to get plain JavaScript objects without Mongoose-specific properties
    const categories = await Category.find().skip(skip).limit(limit).lean();
    const totalCategory = await Category.countDocuments();

    // Clean up the categories: convert _id to string and remove __v
    const cleanedCategories = categories.map((category) => {
      return {
        ...category,
        _id: category._id.toString(), // Convert ObjectId to string
        // Optionally exclude __v or other unwanted properties
        __v: undefined,
      };
    });

    // console.log("Cleaned Categories:", cleanedCategories);

    // Construct the response object
    const response = {
      categories: cleanedCategories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCategory / limit),
        totalCategory: totalCategory,
      },
    };

    // Convert the JavaScript object to XML
    const xmlResponse = js2xmlparser.parse("response", response);

    // Set the Content-Type to 'application/xml'
    res.header("Content-Type", "application/xml");

    // Send the XML response
    res.status(200).send(xmlResponse);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(400).json({ error: "Failed to fetch categories" });
  }
});

module.exports = router;
