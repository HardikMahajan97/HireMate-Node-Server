const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password in queries by default
    },
    profile: {
      firstName: {
        type: String,
        trim: true
      },
      lastName: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      location: {
        type: String,
        trim: true
      }
    },
    preferences: {
      job_types: [{
        type: String,
        enum: ['internship', 'full-time', 'part-time', 'contract']
      }],
      locations: [String],
      work_mode: {
        type: String,
        enum: ['remote', 'hybrid', 'onsite', 'any'],
        default: 'any'
      },
      min_salary: {
        type: Number,
        min: 0
      },
      industries: [String]
    },
    resume: {
      parsed_: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      },
      last_updated: Date
    },
    is_active: {
      type: Boolean,
      default: true
    },
    is_verified: {
      type: Boolean,
      default: false
    },
    last_login: Date
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
