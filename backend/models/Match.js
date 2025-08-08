const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  matched: { type: Boolean, default: false },
  swipes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    liked: { type: Boolean },
    date: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);
