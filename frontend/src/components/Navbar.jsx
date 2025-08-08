import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  if (!isAuthenticated) {
    return null; // Don't show navbar for unauthenticated users
  }

  return (
    <nav className="bg-loveRed text-white px-4 py-3 flex justify-between items-center shadow-lg">
      <div className="font-bold text-2xl tracking-widest">V!B3</div>
      
      <div className="flex items-center space-x-4">
        <Link to="/swipe" className="hover:text-pink transition-colors duration-200">
          Swipe
        </Link>
        <Link to="/chat" className="hover:text-pink transition-colors duration-200">
          Chat
        </Link>
        <Link to="/settings" className="hover:text-pink transition-colors duration-200">
          Settings
        </Link>
        
        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 hover:text-pink transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-pink rounded-full flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block">{user?.name || 'User'}</span>
            <span className="text-xs">▼</span>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">Signed in as</p>
                <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setShowDropdown(false)}
              >
                👤 Profile
              </Link>
              
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setShowDropdown(false)}
              >
                ⚙️ Settings
              </Link>
              
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white hover:text-pink transition-colors duration-200"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>
  );
};

export default Navbar;