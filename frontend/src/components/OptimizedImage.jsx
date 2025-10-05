import React from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { cld, extractPublicId, isCloudinaryUrl } from '../config/cloudinary';

const OptimizedImage = ({ 
  src, 
  alt, 
  width = 400, 
  height = 400, 
  className = '',
  crop = 'fill',
  ...props 
}) => {
  // If it's not a Cloudinary URL, use regular img tag
  if (!isCloudinaryUrl(src)) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        style={{ width, height, objectFit: 'cover' }}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x400?text=Error';
        }}
        {...props}
      />
    );
  }

  // Extract public ID from Cloudinary URL
  const publicId = extractPublicId(src);
  
  if (!publicId) {
    // Fallback to regular img if we can't extract public ID
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        style={{ width, height, objectFit: 'cover' }}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x400?text=Error';
        }}
        {...props}
      />
    );
  }

  // Create optimized Cloudinary image
  const img = cld
    .image(publicId)
    .delivery(format('auto')) // Auto-format (WebP, AVIF when supported)
    .delivery(quality('auto')) // Auto-quality optimization
    .resize(
      auto()
        .gravity(autoGravity())
        .width(width)
        .height(height)
    );

  return (
    <AdvancedImage 
      cldImg={img} 
      className={className}
      alt={alt}
      onError={(e) => {
        // Fallback to placeholder on error
        e.target.src = 'https://via.placeholder.com/400x400?text=Error';
      }}
      {...props}
    />
  );
};

export default OptimizedImage;
