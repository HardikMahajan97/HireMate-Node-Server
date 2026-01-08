const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { resumeLimiter } = require('../middleware/rateLimit.middleware');

/**
 * @route   POST /api/resume/process
 * @desc    Process resume from S3
 * @access  Private
 */
router.post(
  '/process',
  authenticate,
  resumeLimiter,
  validate(resumeController.processSchema),
  resumeController.processResume
);

/**
 * @route   GET /api/resume/parsed
 * @desc    Get parsed resume data
 * @access  Private
 */
router.get(
  '/parsed',
  authenticate,
  resumeController.getParsedResume
);

/**
 * @route   DELETE /api/resume
 * @desc    Delete resume data
 * @access  Private
 */
router.delete(
  '/',
  authenticate,
  resumeController.deleteResume
);

module.exports = router;
