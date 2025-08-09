const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Reference to either a Chat or Match (for direct messages)
  chat: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Chat',
    required: function() { return !this.match; }
  },
  match: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Match',
    required: function() { return !this.chat; }
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: function() { return !this.attachment; } 
  },
  attachment: {
    type: {
      type: String, // 'image', 'video', 'audio', 'document', etc.
      enum: ['image', 'video', 'audio', 'document', 'location', 'contact']
    },
    url: String,
    name: String,
    size: Number
  },
  readBy: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    readAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'system'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    emoji: String,
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  metadata: {
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster querying
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ match: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Virtual for message URL
messageSchema.virtual('messageUrl').get(function() {
  return `/api/messages/${this._id}`;
});

// Method to mark message as read by a user
messageSchema.methods.markAsRead = async function(userId) {
  if (!this.readBy.some(entry => entry.user.equals(userId))) {
    this.readBy.push({ user: userId });
    this.status = 'read';
    await this.save();
  }
  return this;
};

// Method to add a reaction
messageSchema.methods.addReaction = async function(userId, emoji) {
  const existingReaction = this.reactions.find(r => r.user.equals(userId));
  
  if (existingReaction) {
    if (existingReaction.emoji === emoji) {
      // Remove reaction if same emoji is clicked again
      this.reactions = this.reactions.filter(r => !r.user.equals(userId));
    } else {
      // Update existing reaction
      existingReaction.emoji = emoji;
      existingReaction.createdAt = new Date();
    }
  } else {
    // Add new reaction
    this.reactions.push({
      user: userId,
      emoji: emoji,
      createdAt: new Date()
    });
  }
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Message', messageSchema);
