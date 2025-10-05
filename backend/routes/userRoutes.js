const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const photoController = require('../controllers/photoController');
const auth = require('../middleware/authMiddleware');

// User profile routes
router.get('/me', auth, userController.getProfile);
router.put('/me', auth, userController.updateProfile);
router.delete('/me', auth, userController.deleteProfile);

// Photo upload routes
router.get('/photos', auth, photoController.getPhotos);
router.post('/photos', auth, (req, res, next) => {
  console.log('Photo upload route hit');
  photoController.uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({
        success: false,
        message: 'File upload error',
        error: err.message
      });
    }
    console.log('Multer middleware passed, calling uploadPhoto');
    next();
  });
}, photoController.uploadPhoto);
router.delete('/photos', auth, photoController.deletePhoto);

module.exports = router;
