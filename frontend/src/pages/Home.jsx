import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink via-loveRed to-maroon flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow mb-6 animate-fadeIn">Find Your V!B3</h1>
        <p className="text-xl text-white/90 mb-8 max-w-xl animate-fadeIn delay-100">A modern dating app for real connections. Swipe, match, and chat with people who vibe with you.</p>
        <Button 
          onClick={() => navigate('/login')}
          className="text-lg px-8 py-3 shadow-xl animate-bounce"
        >
          Get Started
        </Button>
      </main>
    </div>
  );
};

export default Home;