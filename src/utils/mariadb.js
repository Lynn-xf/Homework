require('dotenv').config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME || "homework_db", // database name
    process.env.DB_USER,   // username
    process.env.DB_PASSWORD,   // password
    {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || "mariadb",
        dialectOptions: {
            // Allow Sequelize to retrieve public key from server
            allowPublicKeyRetrieval: true
        }
    }
);

sequelize.authenticate()
    .then(() => console.log("✅ MariaDB connected"))
    .catch(err => console.error("❌ DB connection error:", err));

module.exports = sequelize;