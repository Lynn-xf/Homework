require("dotenv").config();
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models"); // import Sequelize User model

// ✅ Get all users (only admin can access)
exports.getAllUsers = asyncHandler(async (req, res) => {
    const is_admin = req.user && req.user.is_admin;
    if (!is_admin) {
        return res.status(403).json({ error: "Access denied" });
    }

    // Exclude password field
    const users = await User.findAll({
        attributes: { exclude: ["password"] }
    });

    res.status(200).json(users);
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
exports.login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user || user.password !== password) { // ⚠️ compare hashed pw if using bcrypt
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
        { user_id: user.id, is_admin: user.is_admin },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});
