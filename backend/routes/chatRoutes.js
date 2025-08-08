const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, chatController.sendMessage);
router.get('/:matchId', auth, chatController.getMessages);

module.exports = router;
