const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'member'],
    default: 'member'
  },
  lastReadMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  // For direct messages, this will be empty
  // For group chats, this will be the name of the group
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Chat name cannot be longer than 50 characters']
  },
  // For direct messages, this will be empty
  // For group chats, this can be a description
  description: {
    type: String,
    maxlength: [500, 'Description cannot be longer than 500 characters']
  },
  // Type of chat: 'direct' or 'group'
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true,
    default: 'direct'
  },
  // Participants in the chat
  participants: [participantSchema],
  // For direct messages, we can have exactly 2 participants
  // For group chats, we can have multiple participants
  // This is a virtual to get the other participant in a direct message
  otherParticipant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Reference to the last message in the chat for preview
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // For group chats, who created the group
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.type === 'group'; }
  },
  // Chat settings
  settings: {
    // For group chats, whether it's public or private
    isPublic: {
      type: Boolean,
      default: false
    },
    // For group chats, whether approval is required to join
    approvalRequired: {
      type: Boolean,
      default: false
    },
    // For group chats, whether messages are encrypted
    encrypted: {
      type: Boolean,
      default: false
    },
    // For group chats, whether read receipts are enabled
    readReceipts: {
      type: Boolean,
      default: true
    }
  },
  // Customization
  avatar: {
    type: String,
    default: ''
  },
  // For group chats, whether the chat is active
  isActive: {
    type: Boolean,
    default: true
  },
  // Soft delete flag
  isDeleted: {
    type: Boolean,
    default: false
  },
  // Metadata
  metadata: {
    // For any additional data
    type: Map,
    of: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster querying
chatSchema.index({ 'participants.user': 1, updatedAt: -1 });
chatSchema.index({ type: 1, updatedAt: -1 });
chatSchema.index({ 'lastMessage': 1 });

// Virtual for chat URL
chatSchema.virtual('chatUrl').get(function() {
  return `/api/chats/${this._id}`;
});

// Method to check if a user is a participant in the chat
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method to add a participant to the chat
chatSchema.methods.addParticipant = async function(userId, role = 'member') {
  if (!this.isParticipant(userId)) {
    this.participants.push({
      user: userId,
      role: role
    });
    await this.save();
  }
  return this;
};

// Method to remove a participant from the chat
chatSchema.methods.removeParticipant = async function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  await this.save();
  return this;
};

// Method to update participant role
chatSchema.methods.updateParticipantRole = async function(userId, newRole) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.role = newRole;
    await this.save();
  }
  return this;
};

// Method to mark messages as read for a participant
chatSchema.methods.markAsRead = async function(userId, lastReadMessageId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastReadMessage = lastReadMessageId;
    await this.save();
  }
  return this;
};

// Pre-save hook to validate direct messages have exactly 2 participants
chatSchema.pre('save', function(next) {
  if (this.type === 'direct' && this.participants.length !== 2) {
    const err = new Error('Direct messages must have exactly 2 participants');
    return next(err);
  }
  next();
});

// Pre-remove hook to clean up related messages
chatSchema.pre('remove', async function(next) {
  // In a real app, you might want to archive messages instead of deleting them
  await mongoose.model('Message').deleteMany({ chat: this._id });
  next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
