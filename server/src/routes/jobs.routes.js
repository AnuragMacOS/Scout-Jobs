const express = require('express');
const jobsController = require('../controllers/jobs.controller');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// Public routes for job discovery
router.get('/', jobsController.getJobs);
router.get('/admin/postings', requireAdmin, jobsController.getAdminPostings);
router.get('/:id', jobsController.getJobById);

// Admin job management routes
router.post('/', requireAdmin, jobsController.createJob);
router.patch('/:id', requireAdmin, jobsController.updateJob);
router.delete('/:id', requireAdmin, jobsController.deleteJob);

module.exports = router;
