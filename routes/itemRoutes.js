const express = require("express");
const router = express.Router();
const Item = require("../models/item");
const Category = require("../models/categorySchema");
const mongoose = require("mongoose");
const verifyToken = require("./Authorization/verifyToken");

/**
 * @swagger
 * /api/item:
 *   post:
 *     summary: Create a new item
 *     description: Creates a new item with the specified details.
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the item
 *               description:
 *                 type: string
 *                 description: The description of the item
 *               quantity:
 *                 type: number
 *                 description: The quantity of the item
 *               categoryId:
 *                 type: string
 *                 description: The category ID the item belongs to
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Item created successfully"
 *                 savedItem:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid category ID or bad request
 *       500:
 *         description: Server error
 */
router.post("/item", verifyToken, async (req, res) => {
  const { name, description, quantity, categoryId } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(400).json({ error: "Invalid category ID" });
  }

  const newItem = new Item({
    name,
    description,
    quantity,
    category: category._id,
  });

  try {
    const savedItem = await newItem.save();
    res.status(201).json({ message: "Item created successfully", savedItem });
  } catch (err) {
    console.log("shubha,sihosaid", err);
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items
 *     description: Retrieve a list of all items with pagination.
 *     tags: [Items]
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
 *         description: The number of items per page.
 *     responses:
 *       200:
 *         description: A list of items with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Items fetched successfully"
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     totalItems:
 *                       type: integer
 *                       example: 100
 *       500:
 *         description: Server error
 */

router.get("/items", verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const item = await Item.find().populate("category").skip(skip).limit(limit);
    const totalItem = await Item.countDocuments("category");
    res.status(200).json({
      message: "Items fetched successfully",
      item: item,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItem / limit),
        totalFood: totalItem,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/item/{id}:
 *   get:
 *     summary: Get item by ID
 *     description: Retrieve an item by its ID.
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item
 *     responses:
 *       200:
 *         description: The item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.get("/item/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/items/category/{categoryId}:
 *   get:
 *     summary: Get items by category ID
 *     description: Retrieve items belonging to a specific category.
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID to filter items by
 *     responses:
 *       200:
 *         description: List of items belonging to the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       404:
 *         description: No items found for this category
 *       400:
 *         description: Invalid category ID
 *       500:
 *         description: Server error
 */
router.get("/items/category/:categoryId", verifyToken, async (req, res) => {
  const { categoryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  try {
    const items = await Item.find({ category: categoryId }).populate(
      "category"
    );

    if (items.length === 0) {
      return res
        .status(404)
        .json({ message: "No items found for this category", items });
    }

    res.status(200).json(items);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Item by ID (U)
/**
 * @swagger
 * /api/item/{id}:
 *   put:
 *     summary: Update item by ID
 *     description: Update an existing item by its ID.
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the item
 *               description:
 *                 type: string
 *                 description: The description of the item
 *               quantity:
 *                 type: number
 *                 description: The quantity of the item
 *               categoryId:
 *                 type: string
 *                 description: The category ID to assign to the item
 *     responses:
 *       200:
 *         description: The updated item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *       400:
 *         description: Invalid input or request body
 *       500:
 *         description: Server error
 */
router.put("/item/:id", verifyToken, async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Item by ID (D)
/**
 * @swagger
 * /api/item/{id}:
 *   delete:
 *     summary: Delete item by ID
 *     description: Delete an item by its ID.
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item to delete
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.delete("/item/:id", verifyToken, async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (deletedItem) {
      res.json({ message: "Item deleted" });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
