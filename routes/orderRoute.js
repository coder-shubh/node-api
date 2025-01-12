const express = require("express");
const Order = require("../models/orderSchema");
const verifyToken = require("./Authorization/verifyToken");
const mongoose = require("mongoose");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /api/order:
 *   post:
 *     summary: Create an order
 *     description: Place a new order by providing items, user ID, and total amount.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodItemId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *                       format: float
 *               totalAmount:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order created successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (missing items)
 *       500:
 *         description: Internal Server Error
 */

router.post("/order", verifyToken, async (req, res) => {
  try {
    const { items, userId, totalAmount } = req.body;

    if (!items || !items.length) {
      return res
        .status(400)
        .json({ message: "Order must have at least one item." });
    }

    const orderData = {
      user: userId,
      items: items.map((item) => ({
        foodItem: item.foodItemId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: totalAmount,
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (e) {
    console.error("Error placing order:", error);
    res
      .status(500)
      .json({ message: "Error placing order", error: error.message });
  }
});

/**
 * @swagger
 * /api/order/user/{userId}:
 *   get:
 *     summary: Get orders for a specific user
 *     description: Fetch orders for a user, with optional status filter and pagination.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           description: Filter orders by status (e.g., 'pending', 'completed')
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Items fetched successfully
 *                 order:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalOrders:
 *                       type: integer
 *       400:
 *         description: Invalid User ID
 *       500:
 *         description: Internal Server Error
 */

router.get("/order/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    const { status, page = 1, limit = 10 } = req.query;
    // const order = await Order.find(req.query);

    const query = { user: userId };

    if (status) {
      query.status = status; // Filter orders by status (e.g., 'pending', 'completed', 'canceled')
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate({
        path: "items.foodItem",
        model: "Food",
      })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      message: "Items fetched successfully",
      order: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders: totalOrders,
      },
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

/**
 * @swagger
 * /api/order/user/{userId}/{orderId}:
 *   put:
 *     summary: Update a user's order
 *     description: Update the status and/or items of an existing order.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: orderId
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
 *               status:
 *                 type: string
 *                 description: The status to update (e.g., 'completed', 'pending')
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodItemId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *                       format: float
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order updated successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       403:
 *         description: Forbidden (User is not authorized to update this order)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal Server Error
 */

router.put("/order/user/:userId/:orderId", verifyToken, async (req, res) => {
  try {
    const { userId, orderId } = req.params;
    const { status, items } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this order" });
    }

    const updates = {};
    if (status) {
      updates.status = status;
    }

    if (items) {
      updates.items = items;
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    res
      .status(500)
      .json({ message: "Error updating order", error: error.message });
  }
});

module.exports = router;
