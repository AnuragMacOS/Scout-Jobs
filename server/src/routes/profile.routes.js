const express = require('express');
const profileController = require('../controllers/profile.controller');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', requireAuth, profileController.getProfile);
router.put('/personal', requireAuth, profileController.updatePersonal);
router.put('/academic', requireAuth, profileController.updateAcademic);
router.put('/password', requireAuth, profileController.changePassword);

module.exports = router;
