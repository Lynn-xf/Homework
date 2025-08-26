require("dotenv").config();
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { User } = require("../models"); // import Sequelize User model

// ✅ Get all users (only admin can access)
exports.getAllUser = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: "Access denied" });
    }

    const users = await User.findAll({
        attributes: { exclude: ['password'] } // Sequelize syntax
    });

    res.json(users);
});
// ✅ Register a new user
exports.register = asyncHandler(async (req, res) => {
    const { username, password, is_admin } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
        return res.status(400).json({ error: "Username is already taken" });
    }

    // Create new user
    const newUser = await User.create({
        username,
        password, // ⚠️ should hash password in production with bcrypt
        is_admin: is_admin || false,
    });

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: newUser.id,
            username: newUser.username,
            is_admin: newUser.is_admin
        }
    });
});

// ✅ Login user
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = await User.findOne({ where: { username } });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Compare hashed password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Generate JWT
  const token = jwt.sign(
    { user_id: user.id, is_admin: user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};
