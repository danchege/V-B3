const User = require('../models/User');

/**
 * Middleware to check if the user's profile is complete
 * Redirects to profile setup if not complete
 */
const checkProfileComplete = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('profileComplete preferences location');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is complete
    const hasPreferences = user.preferences && 
                          user.preferences.gender && 
                          user.preferences.gender.length > 0;
    const hasLocation = user.location && 
                       user.location.coordinates && 
                       user.location.coordinates.length === 2;
    const isProfileComplete = user.profileComplete && hasPreferences && hasLocation;

    if (!isProfileComplete) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile to access this feature',
        requiresProfileSetup: true,
        missingFields: {
          profileComplete: !user.profileComplete,
          preferences: !hasPreferences,
          location: !hasLocation
        }
      });
    }

    next();
  } catch (err) {
    console.error('Error checking profile completion:', err);
    res.status(500).json({
      success: false,
      message: 'Error checking profile status',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = checkProfileComplete;
