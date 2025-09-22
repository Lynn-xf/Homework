const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../utils/mariadb"); // Sequelize instance

const User = sequelize.define("User", {
    username: {
        type: DataTypes.STRING,
        allowNull: false
        // Removed unique constraint due to database index limit
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true // Allow null for Cognito users
    },
    cognitoId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'cognito_id' // Map to snake_case in database
    },
    is_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false // is_admin field to indicate if the user is a teacher
    }
}, {
    tableName: "users",
    timestamps: true
});

// Hash password before saving (only if password exists)
User.beforeCreate(async (user, options) => {
    if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

User.beforeUpdate(async (user, options) => {
    if (user.changed("password") && user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

// Compare password method (only works if password exists)
User.prototype.comparePassword = function (candidatePassword) {
    if (!this.password) {
        return Promise.resolve(false); // No password to compare for Cognito users
    }
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
