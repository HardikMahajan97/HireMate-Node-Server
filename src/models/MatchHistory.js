const mongoose = require('mongoose');

const matchHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    match_scores: {
      semantic_score: {
        type: Number,
        min: 0,
        max: 1
      },
      skills_score: {
        type: Number,
        min: 0,
        max: 1
      },
      experience_score: {
        type: Number,
        min: 0,
        max: 1
      },
      composite_score: {
        type: Number,
        min: 0,
        max: 1,
        required: true
      }
    },
    match_percentage: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    matched_skills: [{
      type: String,
      trim: true
    }],
    ranking_position: {
      type: Number,
      min: 1
    },
    viewed: {
      type: Boolean,
      default: false
    },
    saved: {
      type: Boolean,
      default: false
    },
    applied: {
      type: Boolean,
      default: false
    },
    feedback: {
      type: String,
      trim: true
    },
    matched_at: {
      type: Date,
      default: Date.now,
      index: true
    },
    viewed_at: Date,
    applied_at: Date
  },
  {
    timestamps: true
  }
);

// Compound indexes for queries
matchHistorySchema.index({ user_id: 1, matched_at: -1 });
matchHistorySchema.index({ user_id: 1, saved: 1 });
matchHistorySchema.index({ user_id: 1, applied: 1 });

module.exports = mongoose.model('MatchHistory', matchHistorySchema);
