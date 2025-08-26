require("dotenv").config();
const jwt = require("jsonwebtoken");

const authenticateWithJwt = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user; // attach payload to request
        next();
    } catch (err) {
        console.log(`JWT verification failed at ${req.url}:`, err.message);
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = authenticateWithJwt;

