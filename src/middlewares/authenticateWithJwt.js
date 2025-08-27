require("dotenv").config();
const jwt = require("jsonwebtoken");

const authenticateWithJwt = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log("Auth header:", !!authHeader, "Token present:", !!token); // debug

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // normalize both keys so controllers can use either
    req.user = {
      id: payload.id ?? payload.user_id,
      user_id: payload.user_id ?? payload.id,
      is_admin: payload.is_admin ?? false,
    };
    console.log("Decoded user:", req.user); // debug
    return next();
  } catch (err) {
    console.log("JWT verify failed:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticateWithJwt;

