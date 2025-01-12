const express = require("express");
const Food = require("../models/foodSchema");
const router = express.Router();
const verifyToken = require("./Authorization/verifyToken");
const FoodCategory = require("../models/foodCategorySchema");

/**
 * @swagger
 * /api/food:
 *   post:
 *     summary: Add a new food item
 *     tags: [Food]
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
 *               - price
 *               - image
 *               - category
 *               - ingredients
 *               - rating
 *               - servings
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Paneer Butter Masala"
 *               description:
 *                 type: string
 *                 example: "A creamy dish made with paneer"
 *               price:
 *                 type: number
 *                 example: 150
 *               image:
 *                 type: string
 *                 example: "https://example.com/paneer.jpg"
 *               category:
 *                 type: string
 *                 example: "vegetarian"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Paneer", "Tomato", "Butter", "Spices"]
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               servings:
 *                 type: number
 *                 example: 2
 *               coords:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 40.712776
 *                     longitude:
 *                       type: number
 *                       example: -74.005974
 *     responses:
 *       201:
 *         description: Food item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Food item added successfully"
 *                 savedFoodItem:
 *                   $ref: '#/components/schemas/Food'
 *       400:
 *         description: Bad Request, missing required fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide all required fields"
 *       500:
 *         description: Internal Server Error
 */

router.post("/food", verifyToken, async (req, res) => {
  const {
    name,
    description,
    price,
    image,
    category,
    categoryId,
    ingredients,
    isAvailable,
    rating,
    servings,
    coords, // Add coords here
  } = req.body;

  try {
    if (!name || !price || !image || !category || !categoryId || !ingredients || !rating || !servings) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const foodCategory = await FoodCategory.findById(categoryId);
    if (!foodCategory) {
      return res.status(400).json({ error: "Invalid food category ID" });
    }

    const newFoodItem = new Food({
      name,
      description,
      price,
      image,
      category,
      foodCategory: foodCategory._id,
      ingredients,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      rating,
      servings,
      coords, // Save the coords data
    });

    const savedFoodItem = await newFoodItem.save();

    res.status(201).json({ message: "Food item added successfully", savedFoodItem });
  } catch (error) {
    console.error("Error adding food item:", error);
    res.status(500).json({ message: "Error adding food item", error: error.message });
  }
});

/**
 * @swagger
 * /api/food:
 *   get:
 *     summary: Get food items with filters and pagination
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         description: Filter food items by category (e.g., vegetarian, non-vegetarian, vegan, dessert)
 *         required: false
 *         schema:
 *           type: string
 *           example: "vegetarian"
 *       - name: isAvailable
 *         in: query
 *         description: Filter food items by availability (true or false)
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *       - name: minPrice
 *         in: query
 *         description: Filter food items by minimum price
 *         required: false
 *         schema:
 *           type: number
 *           example: 100
 *       - name: maxPrice
 *         in: query
 *         description: Filter food items by maximum price
 *         required: false
 *         schema:
 *           type: number
 *           example: 500
 *       - name: page
 *         in: query
 *         description: Page number for pagination (defaults to 1)
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page for pagination (defaults to 10)
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Successfully fetched the list of food items based on provided filters and pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Food items fetched successfully"
 *                 foodItems:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Food'
 *                 totalItems:
 *                   type: integer
 *                   description: Total number of food items matching the filters
 *                   example: 100
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages based on pagination
 *                   example: 10
 *                 currentPage:
 *                   type: integer
 *                   description: Current page number
 *                   example: 1
 *                 perPage:
 *                   type: integer
 *                   description: Number of food items per page
 *                   example: 10
 *       400:
 *         description: Bad Request, invalid query parameters
 *       500:
 *         description: Internal Server Error
 */

router.get("/food", verifyToken, async (req, res) => {
  try {
    const {
      category,
      isAvailable,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === "true"; 
    }

    if (minPrice) {
      query.price = { $gte: Number(minPrice) };
    }

    if (maxPrice) {
      if (!query.price) query.price = {};
      query.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const foodItems = await Food.find(query)
      .populate("foodCategory")
      .skip(skip)
      .limit(Number(limit));

    const totalFood = await Food.countDocuments(query);

    res.status(200).json({
      message: "Food items fetched successfully",
      foodItems: foodItems,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFood / limit),
        totalFood: totalFood,
      },
    });
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ message: "Error fetching food items", error: error.message });
  }
});

/**
 * @swagger
 * /api/food/{foodId}:
 *   get:
 *     summary: Get a food item by its ID
 *     tags: [Food]
 *     description: Fetch a food item from the database by providing its unique foodId.
 *     parameters:
 *       - name: foodId
 *         in: path
 *         description: The ID of the food item you want to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food item fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Food item fetched successfully"
 *                 foodItem:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60e8eecf5e6b9c36d4e1b50d"
 *                     name:
 *                       type: string
 *                       example: "Cheese Pizza"
 *                     price:
 *                       type: number
 *                       example: 12.99
 *                     category:
 *                       type: string
 *                       example: "pizza"
 *                     foodCategory:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60e8eecf5e6b9c36d4e1b50e"
 *                         name:
 *                           type: string
 *                           example: "Pizza"
 *                     isAvailable:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Food item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Food item not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching food item"
 *                 error:
 *                   type: string
 *                   example: "Error message details here"
 */

router.get('/food/:foodId', verifyToken, async (req, res) => {
  try {
    const { foodId } = req.params;  // Get the foodId from the URL parameter

    // Find food item by foodId
    const foodItem = await Food.findById(foodId).populate('foodCategory');

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Return the found food item
    res.status(200).json({
      message: 'Food item fetched successfully',
      foodItem: foodItem,
    });
  } catch (error) {
    console.error('Error fetching food item by ID:', error);
    res.status(500).json({
      message: 'Error fetching food item',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/food/{id}:
 *   put:
 *     summary: Update a food item by ID
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the food item to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Spicy Paneer Tikka"
 *               description:
 *                 type: string
 *                 example: "A spicy grilled paneer dish"
 *               price:
 *                 type: number
 *                 example: 160
 *               image:
 *                 type: string
 *                 example: "https://example.com/spicy_paneer.jpg"
 *               category:
 *                 type: string
 *                 example: "vegetarian"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Paneer", "Chili", "Spices"]
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *               rating:
 *                 type: number
 *                 example: 4.8
 *               servings:
 *                 type: number
 *                 example: 2
 *               coords:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 40.712776
 *                     longitude:
 *                       type: number
 *                       example: -74.005974
 *     responses:
 *       200:
 *         description: Food item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Food item updated successfully"
 *                 updatedFoodItem:
 *                   $ref: '#/components/schemas/Food'
 *       400:
 *         description: No fields provided for update or invalid input
 *       404:
 *         description: Food item not found
 *       500:
 *         description: Internal Server Error
 */

router.put("/food/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      image,
      category,
      ingredients,
      isAvailable,
      rating,
      servings,
      coords, // Handle coords here as well
    } = req.body;

    // Prepare the update object only with provided fields
    const updateData = {};
    
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (image) updateData.image = image;
    if (category) updateData.category = category;
    if (ingredients) updateData.ingredients = ingredients;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (rating) updateData.rating = rating;
    if (servings) updateData.servings = servings;
    if (coords) updateData.coords = coords; // Update coords if provided

    // Ensure updatedAt is always updated
    updateData.updatedAt = Date.now();

    // If no fields are provided to update, return an error
    if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Find and update the food item by its ID
    const updatedFoodItem = await Food.findByIdAndUpdate(id, updateData, {
      new: true, // Returns the updated document
    });

    if (!updatedFoodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json({
      message: "Food item updated successfully",
      updatedFoodItem,
    });
  } catch (error) {
    console.error(error); // Log error for debugging purposes
    res.status(500).json({ message: "Error updating food item", error: error.message });
  }
});

module.exports = router;
