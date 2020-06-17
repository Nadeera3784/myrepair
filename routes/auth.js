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

router.get('/auth/forgot', AuthController.forgot);

router.post('/auth/forgot_action', 
[
	check('email', "Email is required").not().isEmpty().isEmail()
],
AuthController.forgot_action);

router.get('/auth/reset/:token', AuthController.reset);

router.post('/auth/reset_action/:token', AuthController.reset_action);

module.exports = router;
