const mongoose = require('mongoose');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get current user's profile
// @route   GET /api/users/me
// @access  Private
exports.getProfile = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`\n=== [${requestId}] GET /api/user/me ===`);
  console.log(`[${requestId}] Request URL:`, req.originalUrl);
  console.log(`[${requestId}] Request method:`, req.method);
  console.log(`[${requestId}] Request headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`[${requestId}] Request user:`, req.user ? 'User object exists' : 'No user object');
  
  if (req.user) {
    console.log(`[${requestId}] User object from token:`, JSON.stringify(req.user, null, 2));
    console.log(`[${requestId}] User ID from token:`, req.user.id, 'Type:', typeof req.user.id);
  } else {
    console.log(`[${requestId}] No user object found in request`);
  }
  
  try {
    console.log(`[${requestId}] === START getProfile ===`);
    
    if (!req.user || !req.user.id) {
      const error = new Error('No user ID in request');
      console.error(`[${requestId}] Authentication error:`, {
        message: error.message,
        user: req.user ? 'User object exists' : 'No user object',
        headers: req.headers
      });
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
        details: 'No user ID found in the request',
        error: error.message
      });
    }

    console.log(`[${requestId}] Fetching profile for user ID:`, req.user.id);
    
    try {
      console.log(`[${requestId}] Attempting to find user with ID in database...`);
      
      // Convert ID to string for consistent logging
      const userId = req.user.id.toString();
      console.log(`[${requestId}] User ID to find (string):`, userId);
      
      // Check if ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error(`[${requestId}] Invalid user ID format:`, userId);
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format',
          details: `The provided ID '${userId}' is not a valid MongoDB ID`
        });
      }
      
      // Find user by ID with detailed logging
      console.log(`[${requestId}] Executing database query...`);
      const user = await User.findById(userId)
        .select('-password -__v')
        .populate('matches', 'name photos')
        .lean()
        .catch(err => {
          console.error(`[${requestId}] Database query error:`, {
            name: err.name,
            message: err.message,
            stack: err.stack
          });
          throw err;
        });
        
      console.log(`[${requestId}] Database query completed. User found:`, user ? 'Yes' : 'No');
      
      if (!user) {
        console.error(`[${requestId}] User not found in database`);
        return res.status(404).json({ 
          success: false,
          message: 'User not found',
          details: `No user found with ID: ${userId}`,
          requestId: requestId
        });
      }
      
      // Log user data structure for debugging
      console.log(`[${requestId}] User data structure:`, {
        _id: user._id,
        name: user.name,
        email: user.email,
        hasPhotos: user.photos && user.photos.length > 0,
        matchesCount: user.matches ? user.matches.length : 0,
        location: user.location ? 'Present' : 'Missing',
        preferences: user.preferences ? 'Present' : 'Missing'
      });
      
      console.log(`[${requestId}] Sending successful response`);
      return res.status(200).json({
        success: true,
        data: user,
        requestId: requestId
      });
    } catch (dbError) {
      console.error(`[${requestId}] Database error in getProfile:`, {
        name: dbError.name,
        message: dbError.message,
        code: dbError.code,
        keyPattern: dbError.keyPattern,
        keyValue: dbError.keyValue,
        stack: dbError.stack
      });
      
      // Re-throw with additional context
      const errorWithContext = new Error(`Database error: ${dbError.message}`);
      errorWithContext.originalError = dbError;
      errorWithContext.requestId = requestId;
      throw errorWithContext;
    }
    
    // This code is now in the try block above
  } catch (err) {
    const errorId = `err_${Date.now()}`;
    console.error(`\n=== [${requestId}] ERROR in getProfile (${errorId}) ===`);
    console.error(`[${requestId}] Error details:`, {
      name: err.name,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      originalError: err.originalError ? {
        name: err.originalError.name,
        message: err.originalError.message,
        code: err.originalError.code
      } : 'N/A',
      stack: err.stack
    });
    
    // Check for specific error types
    if (err.name === 'CastError' || (err.originalError && err.originalError.name === 'CastError')) {
      const castError = err.originalError || err;
      console.error(`[${requestId}] Invalid user ID format:`, castError.value);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        details: `The provided ID '${castError.value}' is not a valid MongoDB ID`,
        requestId: requestId,
        errorId: errorId
      });
    }
    
    // Handle MongoDB connection errors
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerError' || 
        (err.originalError && (err.originalError.name === 'MongoNetworkError' || err.originalError.name === 'MongoServerError'))) {
      const mongoError = err.originalError || err;
      console.error(`[${requestId}] Database connection error:`, mongoError.message);
      return res.status(503).json({
        success: false,
        message: 'Database connection error',
        details: 'Unable to connect to the database. Please try again later.',
        requestId: requestId,
        errorId: errorId
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      console.error(`[${requestId}] Validation error:`, err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: err.message,
        fields: err.errors,
        requestId: requestId,
        errorId: errorId
      });
    }
    
    // Default error response
    console.error(`[${requestId}] Unhandled error:`, err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      requestId: requestId,
      errorId: errorId
    });
    
    // Log the complete error for debugging
    console.error(`[${requestId}] Complete error object:`, JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  } finally {
    console.log(`[${requestId}] === END getProfile ===\n`);
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
