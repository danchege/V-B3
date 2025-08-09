const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Chat = require('./Chat');

const swipeSchema = new mongoose.Schema({
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
});

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const preferencesSchema = new mongoose.Schema({
  gender: [{
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer not to say'],
    required: true
  }],
  lookingFor: [{
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer not to say'],
    required: true
  }],
  distance: {
    type: Number,
    min: 1,
    max: 100,
    default: 50
  },
  ageRange: {
    min: {
      type: Number,
      min: 18,
      max: 120,
      default: 18
    },
    max: {
      type: Number,
      min: 18,
      max: 120,
      default: 100
    }
  }
});

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  bio: { 
    type: String, 
    maxlength: [500, 'Bio cannot be longer than 500 characters'],
    default: ''
  },
  age: { 
    type: Number, 
    min: [18, 'You must be at least 18 years old'],
    max: [120, 'Please enter a valid age']
  },
  gender: { 
    type: String, 
    enum: {
      values: ['male', 'female', 'non-binary', 'prefer not to say'],
      message: 'Please select a valid gender'
    },
    required: [true, 'Gender is required']
  },
  interests: [{ 
    type: String,
    trim: true 
  }],
  photos: [{ 
    type: String,
    default: 'https://via.placeholder.com/200',
    validate: {
      validator: function(v) {
        // Basic URL validation for photos
        return /^https?:\/\//.test(v);
      },
      message: props => `${props.value} is not a valid URL`
    }
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    city: String,
    country: String
  },
  preferences: {
    ageRange: {
      min: { type: Number, min: 18, max: 120, default: 18 },
      max: { type: Number, min: 18, max: 120, default: 120 }
    },
    distance: { type: Number, min: 1, max: 100, default: 50 }, // in kilometers
    gender: [{ type: String }]
  },
  profileComplete: { 
    type: Boolean, 
    default: false 
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
