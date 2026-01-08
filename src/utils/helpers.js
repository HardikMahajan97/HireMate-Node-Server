/**
 * General helper functions
 */

/**
 * Sleep/delay function
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sanitize user object (remove sensitive fields)
 */
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  return userObj;
};

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  return require('crypto').randomBytes(length).toString('hex');
};

/**
 * Parse pagination params
 */
const parsePagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Normalize job data from external APIs
 */
const normalizeJobData = (job, source) => {
  return {
    external_id: job.key || job.id || String(Date.now()),
    source,
    title: job.title || job.job_title || '',
    company: job.company || job.company_name || '',
    location: job.location || job.job_location || '',
    description: job.description || job.snippet || '',
    snippet: job.snippet || job.description?.substring(0, 200) || '',
    salary: job.salary || 'Not specified',
    experience_required: job.experience || 'Not specified',
    link: job.link || job.url || '',
    posted_date: job.date || new Date()
  };
};

module.exports = {
  sleep,
  sanitizeUser,
  generateRandomString,
  parsePagination,
  normalizeJobData
};
