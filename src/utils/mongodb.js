const mongoose = require('mongoose');

async function connectToDatabase() {
    const mongoDB = process.env.MONGODB_URI || "mongodb://localhost:27017/homework";
    try {
        if (!mongoDB) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        await mongoose.connect(mongoDB); 
        if (mongoose.connection.db.admin().command({ ping: 1 })) 
            console.log("Ping to MongoDB successful");
        else throw new Error("Ping to MongoDB failed");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}
module.exports = connectToDatabase;