const express = require('express');
const controller = require('../controllers/auth');
const authMiddleware = require('../middlewares/authenticateWithJwt');
const router = express.Router();

router.get('/', authMiddleware, controller.getAllUser);
router.post('/register', controller.register);
router.post('/confirm', controller.confirmSignup);
router.post('/login', controller.login);
router.delete('/:id', authMiddleware, controller.deleteUsebyId);

module.exports = router;