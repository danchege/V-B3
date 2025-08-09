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
    console.error('Error in swipe:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while processing swipe',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Check if there's a mutual match with a specific user
exports.checkMatch = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if there's a mutual like
    const match = await Match.findOne({
      users: { $all: [req.user.id, userId] },
      'swipes.user': { $all: [req.user.id, userId] },
      'swipes.liked': true
    });

    const isMatch = match && match.swipes.every(swipe => swipe.liked);
    
    res.json({
      success: true,
      isMatch,
      matchId: isMatch ? match._id : null
    });
  } catch (err) {
    console.error('Error checking match:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error checking match status',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get match history for the current user
exports.getMatchHistory = async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user.id,
      matched: true
    })
    .populate({
      path: 'users',
      select: 'name age photos bio gender',
      match: { _id: { $ne: req.user.id } } // Exclude current user
    })
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: matches
    });
  } catch (err) {
    console.error('Error fetching match history:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching match history',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getMatches = async (req, res) => {
  try {
    // 1. First, get the current user with all necessary fields
    const currentUser = await User.findById(req.user.id)
      .select('preferences location swipes')
      .lean();
    
    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // 2. Check if user has set up their profile
    if (!currentUser.preferences || !currentUser.location || !currentUser.location.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile and set your location to find matches'
      });
    }

    // 3. Get user's existing matches
    const matches = await Match.find({ 
      users: req.user.id, 
      matched: true 
    }).populate('users', 'name email photos bio gender preferences location');

    // 4. Get user's previously swiped user IDs
    const excludedUserIds = [req.user.id];
    if (currentUser.swipes && currentUser.swipes.length > 0) {
      currentUser.swipes.forEach(swipe => {
        if (swipe.user && !excludedUserIds.includes(swipe.user.toString())) {
          excludedUserIds.push(swipe.user.toString());
        }
      });
    }

    // 5. Build the query for potential matches
    const matchQuery = {
      _id: { $nin: excludedUserIds },
      _id: { $ne: req.user.id }, // Don't match with self
      'preferences.gender': { 
        $in: currentUser.preferences.lookingFor || ['male', 'female', 'non-binary'] 
      },
      gender: { 
        $in: currentUser.preferences.gender || ['male', 'female', 'non-binary'] 
      }
    };

    // 6. Add location-based filtering if coordinates exist
    if (currentUser.location && 
        currentUser.location.coordinates && 
        currentUser.location.coordinates.length === 2) {
      matchQuery['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: currentUser.location.coordinates
          },
          $maxDistance: (currentUser.preferences.distance || 50) * 1000 // Default to 50km
        }
      };
    }

    // 7. Find potential matches
    const potentialMatches = await User.find(matchQuery)
      .select('name age photos bio gender location')
      .limit(10);

    res.json({
      success: true,
      data: potentialMatches,
      matches: matches
    });

  } catch (err) {
    console.error('Error in getMatches:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching matches',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
