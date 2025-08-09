const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/authMiddleware');
const checkProfileComplete = require('../middleware/profileCheck');

// Apply auth middleware to all routes
router.use(auth);

// Apply profile check to routes that require a complete profile
router.use(['/', '/swipe', '/check-match/:userId'], checkProfileComplete);

// Get potential matches for the current user
router.get('/', matchController.getMatches);

// Handle swipe actions (like/dislike)
router.post('/swipe', matchController.swipe);

// Check if there's a mutual match
router.get('/check-match/:userId', matchController.checkMatch);

// Get match history (doesn't require complete profile)
router.get('/history', matchController.getMatchHistory);

module.exports = router;
