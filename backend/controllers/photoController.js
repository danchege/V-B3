const multer = require('multer');
const User = require('../models/User');
const { uploadImageFromBuffer, deleteImage } = require('../config/cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// @desc    Upload profile photo
// @route   POST /api/user/photos
// @access  Private
exports.uploadPhoto = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`\n=== [${requestId}] POST /api/user/photos ===`);
  
  try {
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error(`[${requestId}] Cloudinary configuration missing`);
      return res.status(500).json({
        success: false,
        message: 'Image upload service not configured',
        error: 'Missing Cloudinary configuration'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log(`[${requestId}] Uploading image for user:`, req.user.id);
    console.log(`[${requestId}] File info:`, {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Upload to Cloudinary
    const uploadResult = await uploadImageFromBuffer(req.file.buffer, 'vib3/profiles');
    
    if (!uploadResult.success) {
      console.error(`[${requestId}] Cloudinary upload failed:`, uploadResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: uploadResult.error
      });
    }

    console.log(`[${requestId}] Image uploaded successfully:`, uploadResult.url);

    // Add photo URL to user's photos array
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $addToSet: { 
          photos: uploadResult.url 
        }
      },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      // If user update failed, clean up the uploaded image
      await deleteImage(uploadResult.publicId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`[${requestId}] User photos updated. Total photos:`, user.photos.length);

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        photos: user.photos
      },
      requestId: requestId
    });

  } catch (error) {
    console.error(`[${requestId}] Error in uploadPhoto:`, error);
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.',
          requestId: requestId
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading photo',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      requestId: requestId
    });
  } finally {
    console.log(`[${requestId}] === END uploadPhoto ===\n`);
  }
};

// @desc    Delete profile photo
// @route   DELETE /api/user/photos
// @access  Private
exports.deletePhoto = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`\n=== [${requestId}] DELETE /api/user/photos ===`);
  
  try {
    const { photoUrl } = req.body;
    
    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Photo URL is required'
      });
    }

    console.log(`[${requestId}] Deleting photo for user:`, req.user.id);
    console.log(`[${requestId}] Photo URL:`, photoUrl);

    // Extract public ID from Cloudinary URL
    const publicId = extractPublicIdFromUrl(photoUrl);
    
    if (publicId) {
      // Delete from Cloudinary
      const deleteResult = await deleteImage(publicId);
      console.log(`[${requestId}] Cloudinary deletion result:`, deleteResult);
    }

    // Remove photo URL from user's photos array
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $pull: { 
          photos: photoUrl 
        }
      },
      { new: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`[${requestId}] Photo deleted. Remaining photos:`, user.photos.length);

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully',
      data: {
        photos: user.photos
      },
      requestId: requestId
    });

  } catch (error) {
    console.error(`[${requestId}] Error in deletePhoto:`, error);
    res.status(500).json({
      success: false,
      message: 'Error deleting photo',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      requestId: requestId
    });
  } finally {
    console.log(`[${requestId}] === END deletePhoto ===\n`);
  }
};

// @desc    Get user photos
// @route   GET /api/user/photos
// @access  Private
exports.getPhotos = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('photos');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        photos: user.photos || []
      }
    });

  } catch (error) {
    console.error('Error in getPhotos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching photos',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/vib3/profiles/abc123.webp
    const matches = url.match(/\/v\d+\/(.+)\./);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Export multer upload middleware
exports.uploadMiddleware = upload.single('photo');

module.exports = exports;
