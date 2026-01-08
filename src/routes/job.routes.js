const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

/**
 * @route   GET /api/jobs/search
 * @desc    Search/filter matched jobs
 * @access  Private
 */
router.get(
  '/search',
  authenticate,
  validate(jobController.searchSchema),
  jobController.searchJobs
);

/**
 * @route   GET /api/jobs/saved
 * @desc    Get saved jobs
 * @access  Private
 */
router.get(
  '/saved',
  authenticate,
  jobController.getSavedJobs
);

/**
 * @route   GET /api/jobs/applied
 * @desc    Get applied jobs
 * @access  Private
 */
router.get(
  '/applied',
  authenticate,
  jobController.getAppliedJobs
);

/**
 * @route   GET /api/jobs/stats
 * @desc    Get match statistics
 * @access  Private
 */
router.get(
  '/stats',
  authenticate,
  jobController.getStatistics
);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job details by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  validate(jobController.jobIdSchema),
  jobController.getJobById
);

/**
 * @route   POST /api/jobs/save/:id
 * @desc    Save/bookmark job
 * @access  Private
 */
router.post(
  '/save/:id',
  authenticate,
  validate(jobController.jobIdSchema),
  jobController.saveJob
);

/**
 * @route   DELETE /api/jobs/save/:id
 * @desc    Unsave job
 * @access  Private
 */
router.delete(
  '/save/:id',
  authenticate,
  validate(jobController.jobIdSchema),
  jobController.unsaveJob
);

/**
 * @route   POST /api/jobs/apply/:id
 * @desc    Mark job as applied
 * @access  Private
 */
router.post(
  '/apply/:id',
  authenticate,
  validate(jobController.jobIdSchema),
  jobController.applyToJob
);

module.exports = router;
