require("dotenv").config();
const jwt = require("aws-jwt-verify");
const { User } = require('../models');

const userPoolId = process.env.COGNITO_USER_POOL_ID || "ap-southeast-2_I07bnwdFy"; // Obtain from the AWS console
const clientId = process.env.COGNITO_CLIENT_ID || "6d9099qdimktn8bbodt749e2hs";  // Obtain from the AWS console
const clientSecret = process.env.COGNITO_CLIENT_SECRET || "1sdojnefhltgfpt79eipl7e4mnvqqogn9fc5r95nlip616plqlb4";  // Obtain from the AWS console

const idVerifier = jwt.CognitoJwtVerifier.create({
  userPoolId: userPoolId,
  tokenUse: "id",
  clientId: clientId,
});

async function authenticateWithJwt(req, res, next) {
  try {
    console.log("🔍 JWT middleware called for:", req.method, req.path);
    const authHeader = req.headers["authorization"];
    console.log("🔍 Auth header:", authHeader ? "Present" : "Missing");
    console.log("🔍 Full auth header value:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No authorization header or invalid format");
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    console.log("🔍 Extracted token:", token ? token.substring(0, 50) + "..." : "null");

    // Verify the token (ID token recommended for user info)
    const payload = await idVerifier.verify(token);
    console.log("✅ JWT payload:", JSON.stringify(payload, null, 2));

    // Extract user info from payload
    const user_id = payload["sub"];
    const username = payload["cognito:username"] || payload["username"];
    
    // Check admin status ONLY from Cognito groups (no custom attributes)
    let isAdmin = false;
    if (payload["cognito:groups"] && Array.isArray(payload["cognito:groups"])) {
      isAdmin = payload["cognito:groups"].includes("admin");
    }
    
    console.log(`👤 User authenticated - ID: ${user_id}, Username: ${username}, Admin: ${isAdmin}, Groups: ${JSON.stringify(payload["cognito:groups"] || [])}`);

    // Create or find Cognito user in database to satisfy foreign key constraint
    try {
      await User.findOrCreate({
        where: { cognitoId: user_id }, // Use cognitoId for Cognito users
        defaults: {
          username: username,
          password: null, // Cognito handles authentication
          cognitoId: user_id,
          is_admin: isAdmin
        }
      });
      console.log(`✅ Cognito user ensured in database: ${username} (${user_id})`);
    } catch (dbError) {
      console.error("❌ Failed to create/find Cognito user in database:", dbError.message);
      // Continue anyway - might work if user already exists
    }

    // Attach user info to request
    req.user = {
      user_id,
      username,
      is_admin: isAdmin,
      id: user_id, // For compatibility with existing code
    };

    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authenticateWithJwt;

