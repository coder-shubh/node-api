const express = require("express");
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("./Authorization/verifyToken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();

// CREATE - Add a new user
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user with username, email, and password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *               firstName:
 *                 type: string
 *                 description: The first name of the user
 *               lastName:
 *                 type: string
 *                 description: The last name of the user
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request or validation error
 */

router.post("/users", async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  try {
    const newUser = new User({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    // Save the user
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ - Get all users
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all registered users with pagination.
 *     tags: [Users]
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
 *         description: The number of users per page.
 *     responses:
 *       200:
 *         description: A list of users with pagination information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalUsers:
 *                       type: integer
 *                       example: 50
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */

router.get("/users", verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const users = await User.find().skip(skip).limit(limit);
    const totalUser = await User.countDocuments();
    res.status(200).json({
      users: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUser / limit),
        totalUser: totalUser,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// READ - Get a user by ID
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve details of a specific user by their unique ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized access
 */

router.get("/users/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

// UPDATE - Update user details
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user's details
 *     description: Update the username, email, password, or profile details of a user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               profilePic:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized access
 */

router.put("/users/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { username, email, password, firstName, lastName, profilePic } =
    req.body;

  try {
    // Find the user and update
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If password is provided, hash it
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.profilePic = profilePic || user.profilePic;

    // Save the updated user
    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE - Delete a user
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Permanently delete a specific user from the system.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized access
 */

router.delete("/users/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (user) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

//login api
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     description: Login using email and password to receive a JWT token for further authentication.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login with JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login Successfully"
 *                 token:
 *                   type: string
 *                   example: "jwt_token_here"
 *                 user:
 *                   type: object
 *                   properties:
 *                     userName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 */

const JWT_SECRET = "key";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password match:", isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "8784h",
    });
    // const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      message: "Login Successfully",
      statusCode:res.statusCode,
      token,
      user: {
        id: user._id,
        userName: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Error during login", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/forgot-password:
 * post:
 *  summary: Request a password reset
 * description: Sends an email with a reset link if the email exists
 * tags: [Users]
 * requestBody:
 * required: true
 * content:
 *  application/json:
 *   schema:
 *    type: object
 *   properties:
 *    email:
 *     type: string
 * responses:
 *  200:
 *   description: Password reset email sent
 * 400:
 *  description: User not found
 */

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "No user found with this email address" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpire = Date.now() + 3600000;

    // Store reset token and expiration time in the user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    var transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "c19c3b12032201",
        pass: "b0be0fdedfb9fa",
      },
    });

    const resetUrl = `http://localhost:3000/api/reset-password/${resetToken}`;

    const mailOptions = {
      to: user.email,
      from: "shubham.mavesys@gmail.com",
      subject: "Password Reset Request",
      text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Error sending email" });
      }
      res
        .status(200)
        .json({ message: "Password reset email sent successfully" });
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password and update it
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpire = undefined; // Clear the expiration

    await user.save();

    // Respond with a success message and the updated password (plain text)
    res.status(200).json({
      message: "Password successfully updated",
      updatedPassword: password,  // Returning the plain text password (only for testing)
      confirmation: "Your password has been successfully changed.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
