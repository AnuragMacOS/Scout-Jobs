const express = require('express');
const externalJobsController = require('../controllers/externalJobs.controller');

const router = express.Router();

// External jobs proxy route - available for all visitors with optional auth
router.get('/', externalJobsController.searchExternalJobs);

module.exports = router;
