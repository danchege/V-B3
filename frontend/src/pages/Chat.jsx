import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmojiPicker from '../components/EmojiPicker';

const mockMessages = [
  { sender: 'Alex', text: 'Hey everyone! How\'s your day going? 😊', timestamp: '10:30 AM' },
  { sender: 'Jamie', text: 'Great! Just finished my morning coffee ☕', timestamp: '10:32 AM' },
  { sender: 'You', text: 'Hi! Anyone up for some weekend hiking? 🏔️', timestamp: '10:35 AM' },
  { sender: 'Sam', text: 'I\'m in! What trail are you thinking? 🥾', timestamp: '10:37 AM' },
  { sender: 'Alex', text: 'The one near the lake sounds perfect! 🌊', timestamp: '10:40 AM' },
];

const Chat = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const sendMessage = e => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    
    const newMessage = {
      sender: 'You',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setTimeout(() => {
      setMessages([...messages, newMessage]);
      setInput('');
      setLoading(false);
    }, 500);
  };

  const handleEmojiClick = (emojiObject) => {
    setInput(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink via-loveRed to-maroon flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 flex flex-col animate-fadeIn">
          {/* Forum Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-maroon">Community Forum</h1>
            <p className="text-gray-600">Connect with everyone in the V!B3 community</p>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto mb-4 max-h-96 border rounded-lg p-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-3 ${msg.sender === 'You' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-xs lg:max-w-md ${msg.sender === 'You' ? 'ml-auto' : 'mr-auto'}`}>
                  <div className={`px-4 py-2 rounded-lg ${msg.sender === 'You' ? 'bg-pink text-white' : 'bg-maroon text-white'}`}>
                    <div className="font-semibold text-sm mb-1">{msg.sender}</div>
                    <div>{msg.text}</div>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${msg.sender === 'You' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-center">
                <LoadingSpinner />
              </div>
            )}
          </div>
          
          {/* Message Input with Emoji */}
          <form onSubmit={sendMessage} className="flex gap-2 relative">
            <div className="flex-1 relative">
              <input
                className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-pink"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Share something with the community..."
              />
              <button
                type="button"
                onClick={toggleEmojiPicker}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-2xl hover:scale-110 transition-transform duration-200"
              >
                😊
              </button>
              <EmojiPicker
                isOpen={showEmojiPicker}
                onEmojiClick={handleEmojiClick}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
            <button 
              type="submit" 
              className="bg-loveRed hover:bg-pink text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Chat;