const express = require('express');
const router = express.Router();
const debug = require('eyes').inspector({styles: {all: 'cyan'}});

const { is_authenticated, access_level_verifier} = require('../libraries/access');
const { UserController } = require('../controllers');

router.all('/user/*', is_authenticated, access_level_verifier('user'), function (request, response, next){
	next();
});

router.get('/user/', UserController.index)

router.get('/user/dashboard', UserController.index)

router.get('/user/seeder', UserController.seeder);

module.exports = router;