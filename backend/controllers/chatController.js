const Message = require('../models/Message');
const Match = require('../models/Match');

exports.sendMessage = async (req, res) => {
  try {
    const { matchId, text } = req.body;
    if (!matchId || !text) {
      return res.status(400).json({ message: 'Match ID and text are required.' });
    }
    const match = await Match.findById(matchId);
    if (!match || !match.matched || !match.users.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send message in this match.' });
    }
    const message = new Message({ match: matchId, sender: req.user.id, text });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    let { matchId } = req.params;
    console.log('Received request for matchId:', matchId);
    console.log('Authenticated user ID:', req.user?.id);
    
    // Handle matchId with _user2 suffix
    if (matchId.includes('_user')) {
      matchId = matchId.split('_')[0];
      console.log('Processed matchId after removing suffix:', matchId);
    }
    
    const match = await Match.findById(matchId);
    console.log('Found match:', match);
    
    if (!match) {
      console.log('No match found with ID:', matchId);
      return res.status(404).json({ message: 'Match not found.' });
    }
    
    if (!match.matched) {
      console.log('Match exists but is not in matched state');
      return res.status(403).json({ message: 'This match is not active.' });
    }
    
    if (!match.users.includes(req.user.id)) {
      console.log('User not authorized for this match. Match users:', match.users);
      return res.status(403).json({ 
        message: 'Not authorized to view messages in this match.',
        matchUsers: match.users,
        currentUser: req.user.id
      });
    }
    
    const messages = await Message.find({ match: matchId }).sort({ createdAt: 1 });
    console.log(`Found ${messages.length} messages for match ${matchId}`);
    
    res.json(messages);
  } catch (err) {
    console.error('Error in getMessages:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
