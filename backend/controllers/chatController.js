const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * @desc    Create a new chat (direct or group)
 * @route   POST /api/chats
 * @access  Private
 */
exports.createChat = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { participants, name, type = 'direct' } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }

    // For direct messages, check if a chat already exists between these users
    if (type === 'direct' && participants.length === 1) {
      const existingChat = await Chat.findOne({
        type: 'direct',
        'participants.user': { $all: [userId, ...participants] },
        $where: 'this.participants.length == 2'
      }).session(session);

      if (existingChat) {
        await session.abortTransaction();
        session.endSession();
        return res.status(200).json({
          success: true,
          message: 'Chat already exists',
          chat: existingChat
        });
      }
    }

    // Create the chat
    const chatData = {
      type,
      participants: [
        { user: userId, role: 'admin' },
        ...participants.map(participantId => ({ user: participantId }))
      ],
      createdBy: userId
    };

    if (name) chatData.name = name;
    if (type === 'direct' && participants.length === 1) {
      chatData.otherParticipant = participants[0];
    }

    const chat = await Chat.create([chatData], { session });
    
    // Add chat reference to users
    await User.updateMany(
      { _id: { $in: [userId, ...participants] } },
      { $addToSet: { chats: chat[0]._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const populatedChat = await Chat.findById(chat[0]._id)
      .populate('participants.user', 'name avatar')
      .populate('lastMessage');

    res.status(201).json({
      success: true,
      data: populatedChat
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat',
      error: error.message
    });
  }
};

/**
 * @desc    Get all chats for a user
 * @route   GET /api/chats
 * @access  Private
 */
exports.getUserChats = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find all chats where the user is a participant
    const chats = await Chat.find({
      'participants.user': req.user.id,
      isDeleted: false
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('participants.user', 'name avatar')
      .populate('lastMessage');

    // Get total count for pagination
    const total = await Chat.countDocuments({
      'participants.user': req.user.id,
      isDeleted: false
    });

    res.json({
      success: true,
      count: chats.length,
      total,
      data: chats
    });
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting chats',
      error: error.message
    });
  }
};

/**
 * @desc    Get messages in a chat
 * @route   GET /api/chats/:chatId/messages
 * @access  Private
 */
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { before, limit = 20 } = req.query;

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': req.user.id,
      isDeleted: false
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    // Build query
    const query = { chat: chatId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'name avatar')
      .populate('replyTo');

    // Mark messages as read
    const unreadMessages = messages.filter(
      msg => !msg.readBy.some(entry => entry.user.toString() === req.user.id)
    );

    if (unreadMessages.length > 0) {
      await Promise.all(
        unreadMessages.map(msg => 
          Message.findByIdAndUpdate(msg._id, {
            $addToSet: { readBy: { user: req.user.id } },
            status: 'read'
          })
        )
      );

      // Update last read message in chat
      const lastMessage = messages[0];
      if (lastMessage) {
        await Chat.updateOne(
          { _id: chatId, 'participants.user': req.user.id },
          { $set: { 'participants.$.lastReadMessage': lastMessage._id } }
        );
      }
    }

    res.json({
      success: true,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting messages',
      error: error.message
    });
  }
};

/**
 * @desc    Send a message in a chat
 * @route   POST /api/chats/:chatId/messages
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { chatId } = req.params;
    const { content, attachment, replyTo, type = 'text' } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!content && !attachment) {
      return res.status(400).json({
        success: false,
        message: 'Message content or attachment is required'
      });
    }

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': userId,
      isDeleted: false
    }).session(session);

    if (!chat) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    // Create the message
    const messageData = {
      chat: chatId,
      sender: userId,
      content,
      type,
      status: 'sent'
    };

    if (attachment) {
      messageData.attachment = attachment;
    }

    if (replyTo) {
      messageData.replyTo = replyTo;
    }

    const [message] = await Message.create([messageData], { session });

    // Update chat's last message and timestamp
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save({ session });

    // Mark as read by sender
    message.readBy.push({ user: userId });
    message.status = 'delivered';
    await message.save({ session });

    // Update last read message for sender
    await Chat.updateOne(
      { _id: chatId, 'participants.user': userId },
      { $set: { 'participants.$.lastReadMessage': message._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Populate sender and reply data
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('replyTo');

    // TODO: Emit new message event via WebSocket

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender or has permission to delete
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    // Soft delete the message
    message.metadata.isDeleted = true;
    message.metadata.deletedFor.push(userId);
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

/**
 * @desc    Add reaction to a message
 * @route   POST /api/messages/:messageId/reactions
 * @access  Private
 */
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }

    const message = await Message.findById(messageId)
      .populate('sender', 'name avatar');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({
      _id: message.chat,
      'participants.user': userId,
      isDeleted: false
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to react to this message'
      });
    }

    // Add or update reaction
    await message.addReaction(userId, emoji);
    await message.populate('reactions.user', 'name avatar');

    // TODO: Emit reaction event via WebSocket

    res.json({
      success: true,
      data: message.reactions
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reaction',
      error: error.message
    });
  }
};
