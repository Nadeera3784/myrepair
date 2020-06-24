const express = require('express');
const router = express.Router();

const { AppController } = require('../controllers');

router.get('/', AppController.index);

router.get('/seeds', AppController.seeds);

module.exports = router;
