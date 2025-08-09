const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: [arrayLimit, 'Match requires exactly 2 users']
  }],
  matched: { 
    type: Boolean, 
    default: false,
    index: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  swipes: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    liked: { 
      type: Boolean,
      required: true
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure exactly 2 users in a match
function arrayLimit(val) {
  return val.length === 2;
}

// Add a compound index for faster lookups
MatchSchema.index({ users: 1, matched: 1 });

module.exports = mongoose.model('Match', MatchSchema);
