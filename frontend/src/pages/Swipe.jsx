import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmojiPicker from '../components/EmojiPicker';
import { sendMessage as sendMessageApi, getMessages as getMessagesApi } from '../services/chatService';
import api from '../utils/api';

const Swipe = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [directMessages, setDirectMessages] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Fetch potential matches from the backend
  const fetchPotentialMatches = async () => {
    try {
      const response = await api.get('/api/users/matches');
      if (response.data.success && response.data.data) {
        setUsers(prevUsers => {
          // Filter out any users that are already in the current list
          const newUsers = response.data.data.filter(
            newUser => !prevUsers.some(user => user._id === newUser._id)
          );
          return [...prevUsers, ...newUsers];
        });
      }
    } catch (err) {
      console.error('Error fetching potential matches:', err);
      setError('Failed to load potential matches. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Handle swipe action (like/dislike)
  const handleSwipe = async (liked) => {
    if (!currentUser) return;
    
    const currentUserProfile = users[index];
    
    try {
      if (liked) {
        // If user liked the profile, check for a match
        await api.post('/api/matches', {
          targetUserId: currentUserProfile._id,
          liked: true
        });
        
        // Check if it's a mutual like (match)
        const matchResponse = await api.get(`/api/matches/check-match/${currentUserProfile._id}`);
        if (matchResponse.data.isMatch) {
          // Update the user's matches in the local state
          setUsers(prevUsers => {
            const updatedUsers = [...prevUsers];
            updatedUsers[index] = {
              ...updatedUsers[index],
              matches: [
                ...(updatedUsers[index].matches || []),
                {
                  _id: matchResponse.data.matchId,
                  users: [currentUser._id, currentUserProfile._id],
                  matched: true
                }
              ]
            };
            return updatedUsers;
          });
          
          // Show match notification
          alert(`It's a match with ${currentUserProfile.name}!`);
        }
      }
      
      // Move to the next profile
      if (index < users.length - 1) {
        setIndex(index + 1);
      } else {
        // If we're at the end of the list, fetch more users
        setIsLoadingMore(true);
        await fetchPotentialMatches();
      }
    } catch (err) {
      console.error('Error handling swipe:', err);
      setError('Failed to process your action. Please try again.');
    }
  };

  // Load initial data when component mounts or currentUser changes
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      await fetchPotentialMatches();
    };
    
    loadData();
  }, [currentUser, navigate]);
  
  const user = users[index];

  // Removed duplicate handleSwipe function

  const handleText = async (user) => {
    if (!currentUser?._id) {
      navigate('/login');
      return;
    }

    setSelectedUser(user);
    setShowMessageModal(true);
    setError(null);
    
    try {
      // Check if there's an existing match
      const match = user.matches?.find(match => 
        match.users && 
        match.users.some(id => id.toString() === currentUser._id) && 
        match.users.some(id => id.toString() === user._id)
      );
      
      if (!match) {
        setError('You need to match with this user before messaging');
        return;
      }
      
      console.log('Found match for chat:', match);
      
      if (!match) {
        // For demo purposes, create a match if none exists
        console.log('No existing match found, creating one for demo...');
        const newMatch = {
          _id: `match_${Date.now()}`,
          users: [currentUser.id, user._id],
          matched: true
        };
        
        // Update the user's matches
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u._id === user._id 
              ? { ...u, matches: [...(u.matches || []), newMatch] } 
              : u
          )
        );
        
        // Initialize empty messages for this match
        setDirectMessages(prev => ({
          ...prev,
          [user._id]: []
        }));
        
        return;
      }
      
      // If no existing messages, initialize with an empty array
      if (!directMessages[match._id]) {
        setDirectMessages(prev => ({
          ...prev,
          [match._id]: []
        }));
      }
      
      try {
        // Fetch messages from the server
        const messages = await getMessagesApi(match._id);
        setDirectMessages(prev => ({
          ...prev,
          [match._id]: messages
        }));
      } catch (err) {
        console.error('Error fetching messages:', err);
        // If it's a 404, it means no messages exist yet, which is fine
        if (err.response?.status !== 404) {
          setError('Failed to load messages. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error in handleText:', err);
      setError('An error occurred. Please try again.');
    }
  };

  const sendDirectMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser || !currentUser?._id) return;
    
    try {
      // Find the match between current user and selected user
      const match = selectedUser.matches?.find(match => 
        match.users && 
        match.users.some(id => id.toString() === currentUser._id) && 
        match.users.some(id => id.toString() === selectedUser._id)
      );
      
      if (!match) {
        setError('Cannot send message: No match found with this user');
        return;
      }
      
      // Create a temporary message ID for optimistic update
      const tempMessageId = `temp-${Date.now()}`;
      const newMessage = {
        _id: tempMessageId,
        matchId: match._id,
        sender: currentUser._id,
        content: message,
        timestamp: new Date().toISOString(),
        isSending: true // Flag for optimistic update
      };
      
      // Update local state optimistically
      setDirectMessages(prev => ({
        ...prev,
        [match._id]: [
          ...(prev[match._id] || []),
          newMessage
        ]
      }));
      
      // Clear the message input
      setMessage('');
      
      // In a real app, you might want to update the last message in the match
      
    } catch (err) {
      console.error('Error sending message:', {
        error: err,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('Failed to send message. Please try again.');
    }
  };

  const getUserMessages = (userId) => {
    return directMessages[userId] || [];
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink via-loveRed to-maroon flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink via-loveRed to-maroon flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {user ? (
          <div className="flex flex-col items-center animate-fadeIn">
            <Card user={user} onText={handleText} />
            <div className="flex gap-8 mt-6">
              <Button onClick={() => handleSwipe(false)} className="bg-maroon hover:bg-loveRed">Nope</Button>
              <Button onClick={() => handleSwipe(true)} className="bg-pink hover:bg-loveRed">Like</Button>
            </div>
          </div>
        ) : (
          <p className="text-white text-xl">No more users to swipe!</p>
        )}
      </main>

      {/* Direct Message Modal */}
      {showMessageModal && selectedUser && (
        <Modal onClose={() => setShowMessageModal(false)} title={`Chat with ${selectedUser.name}`}>
          <div className="h-64 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">
            {directMessages[selectedUser._id]?.map((msg, i) => (
              <div 
                key={msg.id || i} 
                className={`mb-3 ${msg.sender === 'You' ? 'text-right' : 'text-left'}`}
              >
                <div className={`inline-block p-3 rounded-lg max-w-xs ${
                  msg.sender === 'You' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <p className="text-sm font-medium text-gray-700">
                    {msg.sender === 'You' ? 'You' : selectedUser.name}
                  </p>
                  <p className="text-gray-800 my-1">{msg.text}</p>
                  <p className="text-xs text-gray-500">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'Just now'}
                  </p>
                </div>
              </div>
            ))}
            {(!directMessages[selectedUser._id] || directMessages[selectedUser._id].length === 0) && (
              <div className="h-full flex items-center justify-center">
                <p className="text-center text-gray-500">
                  No messages yet. Say hi! 👋
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendDirectMessage()}
              className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-pink focus:border-transparent"
              placeholder="Type a message..."
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-600 hover:text-pink transition-colors"
              aria-label="Choose emoji"
            >
              😊
            </button>
            <button
              type="button"
              onClick={sendDirectMessage}
              disabled={!message.trim()}
              className="bg-loveRed hover:bg-pink text-white py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 z-10">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setMessage(prev => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                />
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded">
              {error}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Swipe;