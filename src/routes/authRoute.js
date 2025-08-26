const express = require('express');
const controller = require('../controllers/auth');
const authMiddleware = require('../middlewares/authWithJwt');
const router = express.Router();

router.get('/',controller.getAllUsers);
router.post('/register', controller.register);
router.post('/login', controller.login);

module.exports = router;