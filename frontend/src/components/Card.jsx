import React from 'react';
import OptimizedImage from './OptimizedImage';

const Card = ({ user, children, onText }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs mx-auto border-2 border-maroon">
    <div className="w-32 h-32 mx-auto border-4 border-pink rounded-full overflow-hidden">
      <OptimizedImage 
        src={user?.photos?.[0] || 'https://via.placeholder.com/200?text=No+Photo'} 
        alt={user?.name} 
        width={128}
        height={128}
        className="w-full h-full object-cover"
      />
    </div>
    <h2 className="text-xl font-bold text-maroon mt-4 text-center">{user?.name}</h2>
    <p className="text-pink text-center">{user?.bio}</p>
    <div className="mt-2 flex flex-wrap justify-center gap-2">
      {user?.interests?.map((interest, i) => (
        <span key={i} className="bg-pink text-white px-2 py-1 rounded-full text-xs">{interest}</span>
      ))}
    </div>
    <button 
      onClick={() => onText?.(user)}
      className="mt-4 w-full bg-loveRed hover:bg-pink text-white py-2 px-4 rounded-lg transition-colors duration-200"
      disabled={!onText}
    >
      💬 Text {user?.name}
    </button>
    {children}
  </div>
);

export default Card;