const express = require("express");
const UserAddress = require("../models/userAddressSchema");
const User = require("../models/userSchema");
const router = express.Router();
const verifyToken = require("./Authorization/verifyToken");

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Add a new address
 *     description: Adds a new address to a user, ensuring only one address is marked as primary.
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Address information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *               userId:
 *                 type: string
 *             required:
 *               - street
 *               - city
 *               - state
 *               - zipCode
 *               - country
 *               - userId
 *     responses:
 *       201:
 *         description: Address added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 address:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Internal Server Error
 */

router.post("/addresses", verifyToken, async (req, res) => {
    const { street, city, state, zipCode, country, isPrimary, userId } = req.body;
  
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
  
    try {
      // If the new address is set to be primary, we need to check if the user already has a primary address
      if (isPrimary) {
        // Find if the user already has a primary address
        const existingPrimary = await UserAddress.findOne({
          userId,
          isPrimary: true,
        });
  
        if (existingPrimary) {
          // If a primary address exists, set it to non-primary
          await UserAddress.findByIdAndUpdate(existingPrimary._id, {
            isPrimary: false,
          });
        }
      }
  
      // Create the new address
      const newAddress = new UserAddress({
        street,
        city,
        state,
        zipCode,
        country,
        isPrimary,
        userId, // Associate the address with the user
      });
  
      // Save the new address to the database
      const savedAddress = await newAddress.save();
  
      // Return the success response with the saved address
      res.status(201).json({
        message: "Address added successfully",
        address: savedAddress,
      });
    } catch (err) {
      console.error("Error creating address:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Get all addresses
 *     description: Fetches all addresses in the system.
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 address:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *       500:
 *         description: Internal Server Error
 */

router.get("/addresses", verifyToken, async (req, res) => {
  try {
    const addresses = await UserAddress.find();
    res
      .status(200)
      .json({ message: "Address fetch successfully", address: addresses });
  } catch (err) {
    console.error("Error fetching addresses:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /addresses/user/{userId}:
 *   get:
 *     summary: Get addresses by user ID
 *     description: Fetches all addresses for a specific user.
 *     tags: [Addresses]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to fetch addresses for
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched addresses for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 address:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *       404:
 *         description: No addresses found for this user
 *       500:
 *         description: Internal Server Error
 */

router.get("/addresses/user/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const addresses = await UserAddress.find({ userId });

    if (!addresses.length) {
      return res
        .status(404)
        .json({ message: "No addresses found for this user" });
    }

    res
      .status(200)
      .json({ message: "Address fetch successfully", address: addresses });
  } catch (err) {
    console.error("Error fetching addresses by userId:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     summary: Get address by ID
 *     description: Fetches a specific address by its ID.
 *     tags: [Addresses]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the address to fetch
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched the address
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 address:
 *                   $ref: '#/components/schemas/Address'
 *       404:
 *         description: Address not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/addresses/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const address = await UserAddress.findById(id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res
      .status(200)
      .json({ message: "Address fetch successfully", address: address });
  } catch (err) {
    console.error("Error fetching address by ID:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /addresses/{id}:
 *   put:
 *     summary: Update an address by ID
 *     description: Updates a specific address by its ID and ensures only one address is marked as primary.
 *     tags: [Addresses]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the address to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated address information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully updated the address
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 address:
 *                   $ref: '#/components/schemas/Address'
 *       404:
 *         description: Address not found
 *       500:
 *         description: Internal Server Error
 */
router.put("/addresses/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { street, city, state, zipCode, country, isPrimary, userId } = req.body;

  if (isPrimary) {
    try {
      // Ensure that the user has only one primary address
      // Find the address of the user that is already marked as primary
      const existingPrimary = await UserAddress.findOne({
        userId,
        isPrimary: true,
      });

      if (existingPrimary) {
        // Update the existing primary address to be not primary
        await UserAddress.findByIdAndUpdate(existingPrimary._id, {
          isPrimary: false,
        });
      }

      // Proceed with updating the requested address to primary
      const address = await UserAddress.findByIdAndUpdate(
        id,
        { street, city, state, zipCode, country, isPrimary },
        { new: true } // Returns the updated document
      );

      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      res
        .status(200)
        .json({ message: "Address updated successfully", address: address });
    } catch (err) {
      console.error("Error updating address:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // If it's not primary, proceed without changing the primary status
    try {
      const address = await UserAddress.findByIdAndUpdate(
        id,
        { street, city, state, zipCode, country },
        { new: true }
      );

      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      res
        .status(200)
        .json({ message: "Address updated successfully", address: address });
    } catch (err) {
      console.error("Error updating address:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Delete an address by ID
 *     description: Deletes a specific address by its ID.
 *     tags: [Addresses]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the address to delete
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully deleted the address
 *       404:
 *         description: Address not found
 *       500:
 *         description: Internal Server Error
 */

router.delete("/addresses/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const address = await UserAddress.findByIdAndDelete(id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error("Error deleting address:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
