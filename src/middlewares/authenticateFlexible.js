require("dotenv").config();
const authenticateWithJwt = require('./authenticateWithJwt');
const authenticateWithGoogle = require('./authenticateWithGoogle');

async function authenticateFlexible(req, res, next) {
  try {
    console.log("🔍 Flexible auth middleware called for:", req.method, req.path);
    
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No authorization header or invalid format");
      return res.status(401).json({ error: "No token provided" });
    }
    
    const token = authHeader.split(" ")[1];
    
    // Simple token type detection by examining the payload
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        
        // Check if it's a Google token
        if (payload.iss && payload.iss.includes('accounts.google.com')) {
          console.log("🔍 Detected Google token");
          return authenticateWithGoogle(req, res, next);
        }
        
        // Check if it's a Cognito token
        if (payload.iss && payload.iss.includes('cognito')) {
          console.log("🔍 Detected Cognito token");
          return authenticateWithJwt(req, res, next);
        }
      }
    } catch (decodeError) {
      console.log("🔍 Could not decode token, trying Cognito first");
    }
    
    // Default: Try Cognito first (your existing flow)
    try {
      await new Promise((resolve, reject) => {
        authenticateWithJwt(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("✅ Successfully authenticated with Cognito");
      return next();
    } catch (cognitoError) {
      console.log("🔍 Cognito auth failed, trying Google");
    }
    
    // Fallback: Try Google
    try {
      await new Promise((resolve, reject) => {
        authenticateWithGoogle(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("✅ Successfully authenticated with Google");
      return next();
    } catch (googleError) {
      console.log("❌ Both authentication methods failed");
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    
  } catch (error) {
    console.error("❌ Authentication error:", error.message);
    return res.status(401).json({ error: "Authentication error" });
  }
}

module.exports = authenticateFlexible;