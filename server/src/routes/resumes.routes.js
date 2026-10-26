const express = require('express');
const resumesController = require('../controllers/resumes.controller');
const upload = require('../middleware/upload');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.post('/', requireAuth, upload.single('file'), resumesController.uploadResume);
router.get('/', requireAuth, resumesController.getResumes);
router.delete('/:id', requireAuth, resumesController.deleteResume);
router.get('/:id/download', requireAuth, resumesController.downloadResume);

module.exports = router;
