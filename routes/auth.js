const express = require('express');
const router = express.Router();
const {check} = require('express-validator');

const {AuthController} = require('../controllers');
const {User_Model} = require('../models');

router.get('/auth/login', AuthController.login)

router.get('/auth/logout', AuthController.logout);

router.post('/auth/login/login_action', 
[
	check('email', "Email is required").not().isEmpty(),
	check('email').isEmail(),
	check('password', 'Password is required').not().isEmpty()
],
AuthController.login_action);

router.get('/auth/signup', AuthController.signup)

router.post('/auth/signup/signup_action', 
[   
	check('first_name', 'First name is required').not().isEmpty().trim(),
	check('last_name', 'Last name is required').not().isEmpty().trim(),
	check('email', "Email is required").not().isEmpty().isEmail().normalizeEmail(),
    check('email').custom(function (value) {
        return User_Model.findUserByEmail(value).then(function (email) {
          if (email) {
            return Promise.reject(value + 'already exists, please choose another');
          }
        });
	}),
	check("phone", "Phone number is required")
	.not().isEmpty()
    .isLength({
      min: 10
    })
    .withMessage("Phone number must contain at least 10 characters")
    .isLength({
        max: 10
    })
	.withMessage("Phone number can contain max 10 characters"),
	check('phone').custom(function (value) {
        return User_Model.findUserByPhone(value).then(function (phone) {
          if (phone) {
            return Promise.reject(value + '  already exists, please choose another');
          }
        });
	}),
	check("password", "Password is required")
    .notEmpty()
    .isLength({
      min: 6
    })
    .withMessage("Password must contain at least 6 characters")
    .isLength({
        max: 12
    })
    .withMessage("Password can contain max 12 characters"),
    check("confirm_password", "Confirm Password is required").not().isEmpty(),
    check('confirm_password').custom(function (value, _ref) {
        var req = _ref.req;
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        } 
        return true;
    })
    .withMessage("Passwords do not match"),
],
AuthController.signup_action);

router.get('/auth/forgot', AuthController.forgot);

router.post('/auth/forgot_action', 
[
	check('email', "Email is required").not().isEmpty().isEmail()
],
AuthController.forgot_action);

router.get('/auth/reset/:token', AuthController.reset);

router.post('/auth/reset_action/:token', AuthController.reset_action);

module.exports = router;
