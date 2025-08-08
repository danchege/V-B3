const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/authMiddleware');

router.post('/swipe', auth, matchController.swipe);
router.get('/', auth, matchController.getMatches);

module.exports = router;
