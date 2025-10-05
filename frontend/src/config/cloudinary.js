import { Cloudinary } from '@cloudinary/url-gen';

// Initialize Cloudinary instance
// You can get your cloud name from your Cloudinary dashboard
export const cld = new Cloudinary({ 
  cloud: { 
    cloudName: 'dwvbizmbm' // Replace with your actual cloud name
  } 
});

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url) => {
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/vib3/profiles/abc123.webp
    const matches = url.match(/\/v\d+\/(.+)\./);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Helper function to check if URL is a Cloudinary URL
export const isCloudinaryUrl = (url) => {
  return url && url.includes('res.cloudinary.com');
};

export default cld;
