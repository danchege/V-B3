const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get current user's profile
// @route   GET /api/users/me
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v')
      .populate('matches', 'name photos');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'bio', 'age', 'gender', 'interests', 'location', 'preferences'];
    
    // Filter allowed updates
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Check if profile is complete
    const requiredFields = ['name', 'age', 'gender', 'bio', 'photos'];
    const isProfileComplete = requiredFields.every(field => {
      if (field === 'photos') {
        return req.user[field] && req.user[field].length > 0;
      }
      return req.user[field];
    });

    if (isProfileComplete) {
      filteredUpdates.profileComplete = true;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/users/me
// @access  Private
exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // TODO: Add cleanup for associated data (matches, messages, etc.)
    
    res.status(200).json({
      success: true,
      message: 'Your account has been permanently deleted'
    });
  } catch (err) {
    console.error('Error deleting profile:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Get potential matches
// @route   GET /api/users/matches
// @access  Private
exports.getPotentialMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Build query based on user preferences
    const query = {
      _id: { $ne: user._id }, // Exclude current user
      'preferences.gender': { $in: [user.gender, null, undefined] }, // Match preferred genders
      gender: user.preferences?.gender?.length 
        ? { $in: user.preferences.gender } 
        : { $exists: true },
      age: {
        $gte: user.preferences?.ageRange?.min || 18,
        $lte: user.preferences?.ageRange?.max || 120
      },
      profileComplete: true,
      isActive: true
    };

    // If location is available, add geo-spatial query
    if (user.location?.coordinates?.length === 2) {
      const maxDistance = (user.preferences?.distance || 50) * 1000; // Convert km to meters
      
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: maxDistance
        }
      };
    }

    // Exclude already swiped users
    if (user.swipes?.length > 0) {
      query._id.$nin = user.swipes;
    }

    const potentialMatches = await User.find(query)
      .select('-password -__v -email -createdAt -updatedAt')
      .limit(20);

    res.status(200).json({
      success: true,
      count: potentialMatches.length,
      data: potentialMatches
    });
  } catch (err) {
    console.error('Error fetching potential matches:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching potential matches',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Add or update profile photo
// @route   POST /api/users/me/photos
// @access  Private
exports.addProfilePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    
    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Photo URL is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { photos: photoUrl } },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.status(200).json({
      success: true,
      data: user.photos,
      message: 'Photo added successfully'
    });
  } catch (err) {
    console.error('Error adding profile photo:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error adding profile photo',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/users/me/photos/:photoUrl
// @access  Private
exports.removeProfilePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.params;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { photos: photoUrl } },
      { new: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.photos,
      message: 'Photo removed successfully'
    });
  } catch (err) {
    console.error('Error removing profile photo:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error removing profile photo',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
