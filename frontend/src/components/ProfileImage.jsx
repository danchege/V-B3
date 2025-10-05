import React from 'react';
import OptimizedImage from './OptimizedImage';

const ProfileImage = ({ 
  user, 
  size = 'medium', 
  className = '',
  showOnlineStatus = false,
  ...props 
}) => {
  // Size configurations
  const sizeConfig = {
    small: { width: 40, height: 40, textSize: 'text-sm' },
    medium: { width: 80, height: 80, textSize: 'text-lg' },
    large: { width: 120, height: 120, textSize: 'text-2xl' },
    xlarge: { width: 200, height: 200, textSize: 'text-4xl' }
  };

  const config = sizeConfig[size] || sizeConfig.medium;
  const { width, height, textSize } = config;

  // Get the main profile photo (first photo)
  const profilePhoto = user?.photos?.[0];
  const userName = user?.name || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Base classes for the container
  const containerClasses = `
    relative inline-block rounded-full overflow-hidden bg-gradient-to-br from-pink to-loveRed
    ${className}
  `.trim();

  const imageClasses = `
    w-full h-full object-cover transition-transform duration-200 hover:scale-105
  `.trim();

  return (
    <div 
      className={containerClasses}
      style={{ width: `${width}px`, height: `${height}px` }}
      {...props}
    >
      {profilePhoto ? (
        <OptimizedImage
          src={profilePhoto}
          alt={`${userName}'s profile`}
          width={width}
          height={height}
          className={imageClasses}
        />
      ) : (
        // Fallback to initials if no photo
        <div className={`
          w-full h-full flex items-center justify-center text-white font-bold
          ${textSize}
        `}>
          {userInitials}
        </div>
      )}
      
      {/* Online status indicator */}
      {showOnlineStatus && (
        <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

export default ProfileImage;
