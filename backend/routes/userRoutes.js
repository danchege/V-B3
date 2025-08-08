const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/me', auth, userController.getProfile);
router.put('/me', auth, userController.updateProfile);
router.delete('/me', auth, userController.deleteProfile);

module.exports = router;
