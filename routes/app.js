const express = require('express');
const router = express.Router();

const { AppController } = require('../controllers');

router.get('/', AppController.index);

module.exports = router;
