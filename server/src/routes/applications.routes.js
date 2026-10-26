const express = require('express');
const applicationsController = require('../controllers/applications.controller');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// Student application routes
router.post('/', requireAuth, applicationsController.applyToJob);
router.get('/mine', requireAuth, applicationsController.getMyApplications);
router.patch('/:id/withdraw', requireAuth, applicationsController.withdrawApplication);

// Admin applicant inspection and review routes
router.get('/job/:jobId', requireAdmin, applicationsController.getJobApplicants);
router.patch('/:id/status', requireAdmin, applicationsController.updateApplicationStatus);

module.exports = router;
