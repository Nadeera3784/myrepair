const express = require('express');
const router  = express.Router();
const {check} = require('express-validator');
const path    = require('path');
const multer  = require('multer');
const debug   = require('eyes').inspector({styles: {all: 'cyan'}});

const { is_authenticated, access_level_verifier} = require('../libraries/access.js');
const {DT_admin_order_list, DT_admin_billing_list} = require('../libraries/datatable.js');
const { AdminController} = require('../controllers');
const { User_Model} = require('../models');


router.get('/admin/*', is_authenticated, access_level_verifier('admin'), function (request, response, next){
    next();
});

router.post('/admin/*', is_authenticated, access_level_verifier('admin'), function (request, response, next){
    next();
});

router.get('/admin/', AdminController.index);

router.get('/admin/dashboard', AdminController.index);

router.get('/admin/users', AdminController.users);

router.get('/admin/add_user', AdminController.add_user);

router.post('/admin/add_action_user', 
[
	check('first_name', "First name is required").not().isEmpty().trim().escape(),
    check('last_name', 'Last name is required').not().isEmpty().trim(),
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
    check('email', "Email is required").not().isEmpty().isEmail().normalizeEmail(),
    check('email').custom(function (value) {
        return User_Model.findUserByEmail(value).then(function (user) {
          if (user) {
            return Promise.reject('E-mail already in use');
          }
        });
    }),
    check('phone', "Phone number is required").not().isEmpty().isNumeric(),
    check('role', "Please select at least one role").isIn(['user', 'agent', 'admin']),
    check('subscription_id', 'Subscription is required').not().isEmpty()
],
function (request, response, next){
    AdminController.add_action_user(request, response, next);
});

router.get('/admin/update_user/:user_id', AdminController.update_user);

router.post('/admin/save_user', 
[
	check('first_name', "First name is required").not().isEmpty().trim().escape(),
    check('last_name', 'Last name is required').not().isEmpty().trim(),
    check('email', "Email is required").not().isEmpty().isEmail().normalizeEmail(),
    check('phone', "Phone number is required").not().isEmpty().isNumeric(),
    check('role', "Please select at least one role").isIn(['user', 'agent', 'admin']),
    check('subscription_id', 'Subscription is required').not().isEmpty()
],
function (request, response, next){
    AdminController.save_user(request, response, next);
});

router.get('/admin/force_password_change/:user_id', AdminController.force_password_change);

router.post('/admin/save_force_password_change', 
[
    check("password", "Password is required")
    .not().isEmpty()
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
function (request, response, next){
    AdminController.save_force_password_change(request, response, next);
});

router.post('/admin/delete_user', AdminController.delete_user);

router.get('/admin/subscription', AdminController.subscription);

router.get('/admin/add_subscription', AdminController.add_subscription);

router.post('/admin/add_action_subscription', 
[
	check('title', "Title is required").not().isEmpty().trim().escape(),
    check('limit', 'Limit is required').not().isEmpty().trim().isNumeric(),
    check('price', 'Price is required').not().isEmpty().trim().isNumeric()
],
AdminController.add_action_subscription);

router.get('/admin/update_subscription/:subscription_id', AdminController.update_subscription);

router.post('/admin/save_subscription', 
[
	check('title', "Title is required").not().isEmpty().trim().escape(),
    check('limit', 'Limit is required').not().isEmpty().trim().isNumeric(),
    check('price', 'Price is required').not().isEmpty().trim().isNumeric()
],
AdminController.save_subscription);

router.post('/admin/delete_subscription', AdminController.delete_subscription);

router.get('/admin/brands', AdminController.brands);

router.get('/admin/add_brand', AdminController.add_brand);

router.post('/admin/add_action_brand', 
[
	check('name', "Name is required").not().isEmpty().trim().escape()
],
AdminController.add_action_brand);

router.get('/admin/update_brand/:brand_id', AdminController.update_brand);

router.post('/admin/save_brand', 
[
	check('name', "Name is required").not().isEmpty().trim().escape()
],
AdminController.save_brand);

router.post('/admin/delete_brand', AdminController.delete_brand);

router.get('/admin/announcements', AdminController.announcements);

router.get('/admin/add_announcements', AdminController.add_announcements);

router.post('/admin/add_action_announcements', 
[
    check('title', "Title is required").not().isEmpty().trim().escape(),
    check('announcement_type', "Type is required").not().isEmpty().trim().escape(),
    check('description', "Description is required").not().isEmpty().trim().escape()
],
AdminController.add_action_announcements);

router.get('/admin/update_announcement/:announcement_id', AdminController.update_announcement);

router.post('/admin/delete_announcement', AdminController.delete_announcement);

router.post('/admin/save_announcements', 
[
    check('title', "Title is required").not().isEmpty().trim().escape(),
    check('announcement_type', "Type is required").not().isEmpty().trim().escape(),
    check('description', "Description is required").not().isEmpty().trim().escape()
],
AdminController.save_announcements);

router.get('/admin/orders', AdminController.orders);

router.post('/admin/populate_DT_order_list', DT_admin_order_list);

router.get('/admin/details_order/:order_id', AdminController.details_order);

router.get('/admin/update_order/:order_id', AdminController.update_order);

router.post('/admin/save_order', 
[
	check('brand_id', "Brand is required").not().isEmpty().trim().escape(),
    check('model', 'Model is required').not().isEmpty().trim().escape(),
    check('status', 'Status is required').not().isEmpty().trim().escape(),
    check('amount', "Amount is required").not().isEmpty().trim().isNumeric().escape(),
    check('fault', 'Fault is required').not().isEmpty().trim().escape(),
    check('customer_name', 'Customer name is required').not().isEmpty().trim().escape(),
    check('customer_phone', 'Customer phone is required').not().isEmpty().trim().isNumeric()
],
AdminController.save_order);

router.post('/admin/delete_order', AdminController.delete_order);

router.get('/admin/restore_order/:order_id', AdminController.restore_order);

router.post('/admin/populate_DT_admin_billing_list', DT_admin_billing_list);

router.get('/admin/billing', AdminController.billing);

router.post('/admin/delete_bill', AdminController.delete_bill);

router.get('/admin/update_bill/:bill_id', AdminController.update_bill);

router.get('/admin/details_bill/:bill_id', AdminController.details_bill);

router.post('/admin/save_bill', AdminController.save_bill);

module.exports = router;

