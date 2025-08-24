require("dotenv").config();
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
let {users} = require("../utils/data");

exports.getAllUsers = asyncHandler(async (req, res) => {  
    const is_admin = req.user && req.user.is_admin;
    if (!is_admin) {
        return res.status(403).json({ error: "Access denied" });
    }
    const safeUsers = users.map(({ password, ...user }) => rest); // Exclude password field
    
    res.status(200).json(safeUsers);
});

exports.register = asyncHandler(async (req, res) => {
    const { username, password, is_admin } = req.body;

    // Check if username is already taken
    const existingUser = await users.find(user => user.username == username);
    if (existingUser) {
        return res.status(400).json({ error: "Username is already taken" });
    }

    const newUser = { id: users.length + 1, username, password, is_admin: is_admin || false };
    users.push(newUser);
    res.status(201).json({ message: "User registered successfully", user: { id: newUser.id, username: newUser.username, is_admin: newUser.is_admin } });
});

exports.login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await users.find(user => user.username == username);

    if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    // Generate JWT
    const token = jwt.sign({ user_id: user._id, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ token });
});
