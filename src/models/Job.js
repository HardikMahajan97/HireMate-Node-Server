const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    external_id: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true,
      enum: ['jooble', 'theirstack', 'manual']
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    snippet: {
      type: String,
      trim: true
    },
    salary: {
      type: String,
      default: 'Not specified'
    },
    experience_required: {
      type: String,
      trim: true
    },
    posted_date: {
      type: Date
    },
    job_type: {
      type: String,
      enum: ['internship', 'full-time', 'part-time', 'contract', 'not-specified'],
      default: 'not-specified'
    },
    work_mode: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite', 'not-specified'],
      default: 'not-specified'
    },
    required_skills: [{
      type: String,
      trim: true
    }],
    link: {
      type: String,
      required: true
    },
    fetched_at: {
      type: Date,
      default: Date.now
    },
    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index (same job from same source)
jobSchema.index({ external_id: 1, source: 1 }, { unique: true });

// Query performance indexes
jobSchema.index({ location: 1, experience_required: 1 });
jobSchema.index({ job_type: 1, work_mode: 1 });
jobSchema.index({ fetched_at: 1 });

// Full-text search index
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

// TTL index - auto-delete expired jobs
jobSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Job', jobSchema);
