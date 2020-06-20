const express = require('express');
const router = express.Router();
const {check} = require('express-validator');
const path    = require('path');
const multer  = require('multer');

const { is_authenticated, access_level_verifier} = require('../libraries/access.js');
const { AgentController } = require('../controllers');
const {DT_agent_order_list, DT_agent_billing_list} = require('../libraries/datatable.js');
const {User_Model, Orders_Model} = require('../models');
const moment  = require('../libraries/moment.js');

router.get('/agent/*', is_authenticated, access_level_verifier('agent'), function (request, response, next){
    next();
});

router.post('/agent/*', is_authenticated, access_level_verifier('agent'), function (request, response, next){
    next();
});

router.get('/agent/', AgentController.index);

router.get('/agent/dashboard', AgentController.index);

router.get('/agent/orders', AgentController.orders);

router.post('/agent/populate_DT_agent_order_list', DT_agent_order_list);

router.get('/agent/add_order', AgentController.add_order);


router.post('/agent/add_action_order', 
[
	check('brand_id', "Brand is required").not().isEmpty().trim().escape(),
    check('model', 'Model is required').not().isEmpty().trim().escape(),
    check('status', 'Status is required').not().isEmpty().trim().escape(),
    check('create_date', "Date is required").not().isEmpty().trim().escape(),
    check('fault', 'Fault is required').not().isEmpty().trim().escape(),
    check('customer_name', 'Customer name is required').not().isEmpty().trim().escape(),
    check('customer_phone', 'Customer phone is required').not().isEmpty().trim().isNumeric()
],
AgentController.add_action_order);

router.get('/agent/update_order/:order_id', AgentController.update_order);

router.post('/agent/save_order', AgentController.save_order);

router.get('/agent/details_order/:order_id', AgentController.details_order);

router.post('/agent/delete_order', AgentController.delete_order);

router.get('/agent/subscription', AgentController.subscription);

router.get('/agent/print_order/:order_id', AgentController.print_order);

router.get('/agent/settings', AgentController.settings);

router.post('/agent/save_settings', 
[
	check('first_name', "First name is required").not().isEmpty().trim().escape(),
    check('last_name', 'Last name is required').not().isEmpty().trim().escape(),
    check('email', "Email is required").not().isEmpty().isEmail().normalizeEmail(),
    check('phone', 'Phone is required').not().isEmpty().trim().isNumeric()
],
AgentController.save_settings);

router.get('/agent/change_password', AgentController.change_password);

router.post('/agent/save_password', 
[
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
function (request, response, next){
    AgentController.save_password(request, response, next);
});


router.post('/agent/populate_DT_agent_billing_list', DT_agent_billing_list);

router.get('/agent/billing', AgentController.billing);

router.get('/agent/update_bill/:bill_id', AgentController.update_bill);

router.post('/agent/save_bill', 
[
	check('payment_method', "Payment method is required").not().isEmpty().trim().escape(),
    check('transaction_id', 'Transaction ID is required').not().isEmpty().trim().escape(),
    check('update_date', 'Date is required').not().isEmpty().trim()
],
AgentController.save_bill);

router.get('/agent/details_bill/:bill_id', AgentController.details_bill);

router.get('/agent/week', async  function (request, response, next){

    const mongoose = require('mongoose');

    var currentDate = moment();

    var weekStart = currentDate.startOf('week');
    
    var weekEnd = currentDate.endOf('week');
    
    var days_array = [];

    for (i = 0; i <= 6; i++) {
        days_array.push(moment(weekStart).add(i, 'days').format("YYYY-M-D"));
    }

    var data = {};

    data['weekdata'] = [];

    days_array.forEach( function(sd, index){

        data['weekdata'][index] = {
            "date" : sd,
        };

        data['weekdata'][index]['booking'] = "12";

        // Orders_Model.countDocuments({
        //     "user_id" : mongoose.Types.ObjectId(request.session.userId),
        //     //"order_create_date" :  xd.toString()
        // }, function(err, order_count){
        //     // data['weekdata'][index].push({
        //     //     "booking" : "5"
        //     // });

        //     //data['weekdata'][index]["booking"] = order_count;
        //     //Object.assign(data['weekdata'][index], data['weekdata'][index]["booking"][index]);;
           
        //     //data.push(order_count);

        //     //data['weekdata'][index]["booking"] = "15";

        //     // data['weekdata'][index]['booking'].push({
        //     //     'booking' : "15"
        //     // });
        //     //data['weekdata'][index]['booking'] = "12";
        //    // td.push(order_count);
        // });


    });

    response.status(200).json({
        message : data
    });
});

router.get('/agent/plugins', AgentController.plugins);

router.get('/agent/plugin',  function (request, response, next){
    const { get_all_plugins } = require('../plugins/Plugin_interface.js');
    get_all_plugins().then(function(plugin_list) {

        var dd =  [];
        plugin_list.forEach(function(pluginName, index){
            dd.push(pluginName.plugin.name);
        });

        console.log(dd);

        var found_index = dd.indexOf("logger");
        if (found_index > -1) {
            dd.splice(found_index, 1);
        }

        console.log(dd);

        response.status(200).json({
			message : "successs"
        });
        
    }, function(err) {
		response.status(200).json({
			message : "erro"
		});
    });
});


module.exports = router;
