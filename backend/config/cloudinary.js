const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 seconds timeout
  secure: true
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {string} folder - Cloudinary folder to upload to
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadImage = async (filePath, folder = 'vib3/profiles') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      transformation: [
        { width: 800, height: 800, crop: 'fill', quality: 'auto' },
        { format: 'webp' } // Convert to WebP for better compression
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    });
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload image from buffer (for memory uploads)
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder to upload to
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadImageFromBuffer = async (buffer, folder = 'vib3/profiles', retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Cloudinary upload attempt ${attempt}/${retries}`);
      
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            transformation: [
              { width: 800, height: 800, crop: 'fill', quality: 'auto' },
              { format: 'webp' }
            ],
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            timeout: 60000 // 60 seconds
          },
          (error, result) => {
            if (error) {
              console.error(`Cloudinary upload error (attempt ${attempt}):`, error);
              reject(error);
            } else {
              console.log(`Cloudinary upload successful (attempt ${attempt})`);
              resolve(result);
            }
          }
        );
        
        uploadStream.end(buffer);
      });

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      };

    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        return {
          success: false,
          error: `Upload failed after ${retries} attempts: ${error.message}`
        };
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<Object>} - Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 400,
    height: 400,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  };
  
  const transformOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, transformOptions);
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadImageFromBuffer,
  deleteImage,
  getOptimizedImageUrl
};
