import React from 'react';

const Card = ({ user, children, onText }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs mx-auto border-2 border-maroon">
    <img src={user?.photos?.[0] || '/default-avatar.png'} alt={user?.name} className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-pink" />
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