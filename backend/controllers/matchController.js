const Match = require('../models/Match');
const User = require('../models/User');

exports.swipe = async (req, res) => {
  try {
    const { targetUserId, liked } = req.body;
    if (!targetUserId || typeof liked !== 'boolean') {
      return res.status(400).json({ message: 'Invalid swipe data.' });
    }
    let match = await Match.findOne({ users: { $all: [req.user.id, targetUserId] } });
    if (!match) {
      match = new Match({ users: [req.user.id, targetUserId], swipes: [] });
    }
    match.swipes.push({ user: req.user.id, liked });
    // Check for mutual like
    const userSwipes = match.swipes.filter(s => s.user.toString() === req.user.id && s.liked);
    const targetSwipes = match.swipes.filter(s => s.user.toString() === targetUserId && s.liked);
    if (userSwipes.length && targetSwipes.length) {
      match.matched = true;
    }
    await match.save();
    res.json({ matched: match.matched });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMatches = async (req, res) => {
  try {
    const matches = await Match.find({ users: req.user.id, matched: true }).populate('users', 'name email photos');
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
