const express = require('express');
const router = express.Router();
const {check} = require('express-validator');

const {AuthController} = require('../controllers');


router.get('/auth/login', AuthController.login)

router.get('/auth/logout', AuthController.logout);

router.post('/auth/login/login_action', 
[
	check('email', "Email is required").not().isEmpty(),
	check('email').isEmail(),
	check('password', 'Password is required').not().isEmpty()
],
AuthController.login_action);


module.exports = router;
