require("dotenv").config();

const asyncHandler = require("express-async-handler");
const { User } = require("../models"); // Import User model

// Cognito .env
const userPoolId = process.env.COGNITO_USER_POOL_ID || "ap-southeast-2_I07bnwdFy";
const clientId = process.env.COGNITO_CLIENT_ID || "6d9099qdimktn8bbodt749e2hs";
const clientSecret = process.env.COGNITO_CLIENT_SECRET || "1sdojnefhltgfpt79eipl7e4mnvqqogn9fc5r95nlip616plqlb4";

// Crypto for hashing
const crypto = require("crypto");

// Cognito imports
const { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand, 
  InitiateAuthCommand, 
  AdminAddUserToGroupCommand,
  AdminDeleteUserCommand
} = require("@aws-sdk/client-cognito-identity-provider");

// Hashing password
function secretHash(clientId, clientSecret, username) {
  const hasher = crypto.createHmac('sha256', clientSecret);
  hasher.update(`${username}${clientId}`);
  return hasher.digest('base64');
}

const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-southeast-2" });

// ✅ Get all users (only admin can access)
exports.getAllUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    // Get users from local database (synced from Cognito during login)
    const users = await User.findAll({
      attributes: ['id', 'username', 'cognitoId', 'is_admin', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

exports.register = asyncHandler(async (req, res) => {
  const { username, password, email, is_admin } = req.body;
  try {
    // Register user with Cognito (email only for confirmation)
    const command = new SignUpCommand({
      ClientId: clientId,
      Username: username,
      Password: password,
      SecretHash: secretHash(clientId, clientSecret, username),
      UserAttributes: [
        { Name: "email", Value: email }
      ]
    });
    const response = await cognitoClient.send(command);

    console.log(`✅ User ${username} registered in Cognito`);
    if (is_admin) {
      console.log(`📝 Admin status noted for ${username} - will be added to admin group after confirmation`);
    }

    res.status(201).json({
      message: "User registered. Please confirm your email.",
      user: { username, is_admin }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Confirm signup
exports.confirmSignup = asyncHandler(async (req, res) => {
  const { username, confirmationCode, is_admin } = req.body;
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: username,
      ConfirmationCode: confirmationCode,
      SecretHash: secretHash(clientId, clientSecret, username)
    });
    await cognitoClient.send(command);

    console.log(`✅ User ${username} confirmed successfully in Cognito`);

    // If user registered as admin, add them to Cognito admin group
    if (is_admin) {
      try {
        const addGroupCmd = new AdminAddUserToGroupCommand({
          UserPoolId: userPoolId,
          Username: username,
          GroupName: "admin"
        });
        await cognitoClient.send(addGroupCmd);
        console.log(`✅ Added user ${username} to admin group in Cognito`);
      } catch (groupError) {
        console.error(`❌ Failed to add user to admin group: ${groupError.message}`);
        return res.status(500).json({ 
          error: "User confirmed but failed to add to admin group. Please contact administrator.",
          details: groupError.message 
        });
      }
    }

    res.json({ 
      message: "User confirmed successfully. Please log in.",
      nextStep: "login"
    });
  } catch (err) {
    console.error("❌ Confirmation error:", err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login user
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  try {
    console.log(`🔐 Attempting login for user: ${username}`);
    
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash(clientId, clientSecret, username)
      }
    });
    const response = await cognitoClient.send(command);
    
    console.log("📋 Full Cognito response:", JSON.stringify(response, null, 2));
    
    // Handle different authentication states
    if (response.ChallengeName) {
      console.log(`⚠️  Authentication challenge required: ${response.ChallengeName}`);
      return res.status(200).json({
        message: "Authentication challenge required",
        challengeName: response.ChallengeName,
        challengeParameters: response.ChallengeParameters,
        session: response.Session
      });
    }
    
    // Check if authentication was successful and tokens are present
    if (!response.AuthenticationResult) {
      console.error("❌ Authentication failed: No AuthenticationResult in response");
      console.error("Response structure:", JSON.stringify(response, null, 2));
      return res.status(401).json({ error: "Authentication failed: No tokens received" });
    }

    if (!response.AuthenticationResult.IdToken) {
      console.error("❌ Authentication failed: No IdToken in AuthenticationResult");
      console.error("AuthenticationResult:", JSON.stringify(response.AuthenticationResult, null, 2));
      return res.status(401).json({ error: "Authentication failed: No ID token received" });
    }

    console.log(`✅ Login successful for user: ${username}`);
    console.log(`✅ ID token received: ${response.AuthenticationResult.IdToken.substring(0, 50)}...`);
    
    // Decode the ID token to get user information for local database sync
    try {
      const idToken = response.AuthenticationResult.IdToken;
      const tokenPayload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      
      console.log(`🔄 Syncing user to local database: ${username}`);
      console.log(`📋 Token payload:`, tokenPayload);
      
      const cognitoUserId = tokenPayload.sub;
      const isAdmin = tokenPayload['cognito:groups']?.includes('admin') || false;
      
      console.log(`👤 User groups: ${tokenPayload['cognito:groups'] || 'none'}`);
      console.log(`🔑 Is admin: ${isAdmin}`);
      
      if (cognitoUserId) {
        // Sync user to local database with info from Cognito token
        const [localUser, created] = await User.findOrCreate({
          where: { cognitoId: cognitoUserId },
          defaults: {
            username: username,
            cognitoId: cognitoUserId,
            password: null, // No password for Cognito users
            is_admin: isAdmin // Get admin status from Cognito groups
          }
        });

        if (created) {
          console.log(`✅ Created new local user record for: ${username} (${cognitoUserId}) - Admin: ${isAdmin}`);
        } else {
          // Update existing record with current info
          await localUser.update({
            username: username,
            is_admin: isAdmin // Update admin status from Cognito groups
          });
          console.log(`🔄 Updated local user record for: ${username} (${cognitoUserId}) - Admin: ${isAdmin}`);
        }
      }
    } catch (syncError) {
      console.error("❌ Error synchronizing user to local database:", syncError);
      // Don't fail the login - user is authenticated in Cognito
      console.warn("⚠️  User authenticated but local sync failed - continuing anyway");
    }
    
    res.json({
      message: "Login successful",
      token: response.AuthenticationResult.IdToken,
      tokens: response.AuthenticationResult
    });
    
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(401).json({ error: err.message });
  }
});

//delete user by user id
exports.deleteUsebyId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: "Access denied" });
  }
  try {
    const command = new AdminDeleteUserCommand({
      UserPoolId: userPoolId,
      Username: userId
    });
    await cognitoClient.send(command);
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
