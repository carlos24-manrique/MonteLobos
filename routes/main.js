const express = require('express');
const mainController = require('../controllers/mainController');

const router = express.Router();

router.get('/', mainController.home);
router.get('/api/status', mainController.status);

module.exports = router;
