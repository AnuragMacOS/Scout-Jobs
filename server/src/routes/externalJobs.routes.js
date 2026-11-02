const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const externalJobsController = require('../controllers/externalJobs.controller');

const router = express.Router();

// Protected external jobs proxy route - login required to access search API
router.get('/', requireAuth, externalJobsController.searchExternalJobs);

module.exports = router;
