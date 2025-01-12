const express = require("express");
const Subscription = require("../models/SubscriptionSchema");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Subscription management for users
 */

/**
 * @swagger
 * /api/subscription:
 *   post:
 *     summary: Create a new subscription plan
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: ['Weekly', 'Monthly']
 *                 description: The subscription plan type (Weekly or Monthly).
 *               mealType:
 *                 type: string
 *                 enum: ['Veg', 'Non-Veg']
 *                 description: The meal type option for the subscription.
 *               price:
 *                 type: number
 *                 description: The price of the subscription plan.
 *               mealCount:
 *                 type: number
 *                 description: The number of meals included in the subscription.
 *               freeDelivery:
 *                 type: boolean
 *                 description: Indicates whether the subscription includes free delivery.
 *     responses:
 *       201:
 *         description: Subscription successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subscription created successfully!
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Bad request or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating subscription
 *                 error:
 *                   type: string
 *                   example: Error message
 */

router.post("/subscription", async (req, res) => {
  const { plan, mealType, price, mealCount, freeDelivery } = req.body;

  // Validate required fields (without user field)
  if (!plan || !mealType || !price || !mealCount) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newSubscription = new Subscription({
      plan,
      mealType,
      price,
      mealCount,
      freeDelivery, // Only these fields should be included
    });

    await newSubscription.save();
    res.status(201).json({
      message: "Subscription created successfully!",
      subscription: newSubscription,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating subscription", error: err.message });
  }
});

/**
 * @swagger
 * /api/subscription:
 *   get:
 *     summary: Get all subscriptions
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: List of all subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Error fetching subscriptions
 */
router.get("/subscription", async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.status(200).json(subscriptions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching subscriptions", error: err.message });
  }
});

/**
 * @swagger
 * /api/subscription/no-user:
 *   get:
 *     summary: Get subscriptions without a user
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: List of subscriptions with no associated user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching subscriptions without user
 *                 error:
 *                   type: string
 *                   example: Error message
 */

router.get("/subscription/no-user", async (req, res) => {
  try {
    // Fetch subscriptions where the user field is null or undefined
    const subscriptionsWithoutUser = await Subscription.find({
      user: { $exists: false },
    });

    // If no such subscriptions are found, return a message
    if (!subscriptionsWithoutUser || subscriptionsWithoutUser.length === 0) {
      return res
        .status(404)
        .json({ message: "No subscriptions without user found" });
    }

    res.status(200).json(subscriptionsWithoutUser);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching subscriptions without user",
      error: err.message,
    });
  }
});

/**
 * @swagger
 * /api/subscribe:
 *   post:
 *     summary: Subscribe a user to a subscription plan by subscription ID
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: The ObjectId of the user who is subscribing.
 *               subscriptionId:
 *                 type: string
 *                 description: The ObjectId of the subscription plan the user is subscribing to.
 *     responses:
 *       201:
 *         description: User successfully subscribed to the plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User successfully subscribed!
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Bad request or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subscription not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error subscribing user
 *                 error:
 *                   type: string
 *                   example: Error message
 */

router.post("/subscribe", async (req, res) => {
  const { user, subscriptionId } = req.body;

  // Validate required fields
  if (!user || !subscriptionId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Fetch the subscription details by subscriptionId
    const subscription = await Subscription.findById(subscriptionId);

    // If the subscription does not exist, return an error
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Create a user-specific subscription with the provided subscriptionId
    const newUserSubscription = new Subscription({
      user, // User to subscribe
      plan: subscription.plan, // Plan from global subscription
      mealType: subscription.mealType, // Meal type from global subscription
      price: subscription.price, // Price from global subscription
      mealCount: subscription.mealCount, // Meal count from global subscription
      freeDelivery: subscription.freeDelivery, // Free delivery from global subscription
    });

    // Save the new subscription for the user
    await newUserSubscription.save();

    res.status(201).json({
      message: "User successfully subscribed!",
      subscription: newUserSubscription,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error subscribing user", error: err.message });
  }
});

/**
 * @swagger
 * /api/subscribe/{userId}:
 *   get:
 *     summary: Get all subscriptions by a specific user
 *     tags: [Subscription]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subscriptions for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: User not found
 *       500:
 *         description: Error fetching subscriptions for the user
 */
router.get("/subscribe/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const subscriptions = await Subscription.find({ user: userId });

    if (!subscriptions || subscriptions.length === 0) {
      return res
        .status(404)
        .json({ message: "No subscriptions found for this user." });
    }

    res.status(200).json(subscriptions);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching subscriptions for the user",
      error: err.message,
    });
  }
});

module.exports = router;
