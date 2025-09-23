require("dotenv").config();
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { User } = require('../models');

const googleClientId = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";
const client = new OAuth2Client(googleClientId);

// Convert Google user ID to a safe integer ID for database compatibility
function googleIdToIntegerId(googleId) {
  // Create a hash of the Google ID and convert to a positive integer
  const hash = crypto.createHash('sha256').update(googleId).digest('hex');
  // Take first 7 characters and convert to integer to stay within signed INT range
  const intId = parseInt(hash.substring(0, 7), 16);
  // Ensure it fits in signed 32-bit INT (max 2,147,483,647)
  return Math.abs(intId) % 2000000000; // Keep under 2 billion for safety
}

async function authenticateWithGoogle(req, res, next) {
  try {
    console.log("🔍 Google Auth middleware called for:", req.method, req.path);
    const authHeader = req.headers["authorization"];
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No authorization header or invalid format");
      return res.status(401).json({ error: "No token provided" });
    }
    
    const token = authHeader.split(" ")[1];
    console.log("🔍 Extracted Google token:", token ? token.substring(0, 50) + "..." : "null");

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });
    
    const payload = ticket.getPayload();
    console.log("✅ Google JWT payload:", JSON.stringify(payload, null, 2));

    // Extract user info from Google payload
    const google_user_id = payload.sub; // Original Google user ID
    const email = payload.email;
    const name = payload.name;
    
    // Convert Google ID to database-compatible integer ID
    const database_user_id = googleIdToIntegerId(google_user_id);
    
    // Create or find user in database to satisfy foreign key constraint
    try {
      await User.findOrCreate({
        where: { id: database_user_id },
        defaults: {
          id: database_user_id,
          username: name || email || `google_user_${database_user_id}`,
          password: null, // Google users don't have passwords
          cognitoId: null, // Not a Cognito user
          is_admin: false
        }
      });
      console.log(`✅ Google user ensured in database: ID ${database_user_id}`);
    } catch (dbError) {
      console.error("❌ Failed to create/find Google user in database:", dbError.message);
      // Continue anyway - might work if user already exists
    }
    
    // Simple admin check - you can customize this
    const isAdmin = email === 'admin@example.com'; // Set your admin email here
    
    console.log(`👤 Google User authenticated - Original ID: ${google_user_id}, Database ID: ${database_user_id}, Email: ${email}, Name: ${name}, Admin: ${isAdmin}`);

    // Attach user info to request (compatible with existing code)
    req.user = {
      user_id: database_user_id, // Use converted integer ID for database
      username: name || email, // Use name or email as username
      email,
      is_admin: isAdmin,
      id: database_user_id, // For compatibility with existing code
      auth_provider: 'google',
      google_id: google_user_id // Keep original for reference
    };

    next();
  } catch (error) {
    console.error("❌ Google token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired Google token" });
  }
}

module.exports = authenticateWithGoogle;