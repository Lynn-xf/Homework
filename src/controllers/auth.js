require("dotenv").config();
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");

exports.getAllUsers = asyncHandler(async (req, res) => {  
    const is_admin = req.user && req.user.is_admin;
    if (!is_admin) {
        return res.status(403).json({ error: "Access denied" });
    }
    const users = await User.find({}, '-password'); // Exclude password field
    res.status(200).json(users);
});

exports.register = asyncHandler(async (req, res) => {
    const { username, password, is_admin } = req.body;

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: "Username is already taken" });
    }

    const user = new User({ username, password, is_admin });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
});

exports.login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ user_id: user._id, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});
