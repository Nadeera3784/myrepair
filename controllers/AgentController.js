const {validationResult } = require('express-validator');
const debug = require('eyes').inspector({styles: {all: 'cyan'}});
const path    = require('path');
const fs      = require('fs');
const slugify = require('slugify')
const mongoose = require('mongoose');
const moment = require('../libraries/moment.js');

const {User_Model, Announcements_Model, Brands_Model, Orders_Model, Subscription_Model} = require('../models');
const config_app        = require('../config/app.js');
const {get_all_plugins} = require('../plugins/Plugin_interface.js');
const RandomizerHelper  = require('../helpers/randomizer.js');
const {generate_pdf}  = require('../libraries/pdf.js');

const AgentController = {

	async index(request, response, next){
		const user_private_announcements = await Announcements_Model.find({
			"announcement_users": {
				 "$in": [request.session.userId]
			}
		});

		const public_announcements = await Announcements_Model.find({ announcement_type : "public"});

		response.status(200);
		response.render("agent/dashboard", {
			helper: request.helper,
			user_private_announcements : user_private_announcements,
			public_announcements : public_announcements
		});
	},
	async orders(request, response, next){
		const brands = await Brands_Model.find({});
		const beforestylesheets = [
			"assets/css/select2.css"
		];
		const stylesheets = [
			"assets/css/jquery.dataTables.min.css",
			"assets/css/responsive.dataTables.min.css",
			'assets/css/daterangepicker.css',
			"assets/css/dialog.css",
		];
		const javascript = [
			"assets/js/jquery.dataTables.min.js",
			"assets/js/responsive.dataTables.min.js",
			"assets/js/dataTables.bootstrap.min.js",
			"assets/js/select2.js",
			"assets/js/moment.js",
			"assets/js/daterangepicker.js",
			"assets/js/dialog.js",
			"assets/js/app.js",
		];
		response.status(200);
		response.render("agent/orders", {
			helper: request.helper,
			css : stylesheets,
			beforecss : beforestylesheets,
			js : javascript,
			brands : brands,
		});
	},
	async add_order(request, response, next){
		const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
		const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD');
		const user = await User_Model.findById(mongoose.Types.ObjectId(request.session.userId)).populate('subscription_id');
		const brands = await Brands_Model.find({});
		Orders_Model.countDocuments({
			"user_id" : mongoose.Types.ObjectId(request.session.userId),
			"order_create_date" : {
				'$gte': startOfMonth, 
				'$lt': endOfMonth
			}
		}, function (err, current_user_count) {
			if(current_user_count >= user.subscription_id.subscription_limit){
				response.status(201);
				request.flash('danger', 'You have exceeded the limit of orders, you can create in a month. Please upgrade your subscription');
				response.redirect(request.helper.base_url() +'agent/orders');
			}else{
				const beforestylesheets = [
					"assets/css/select2.css"
				];
				const stylesheets = [
					"assets/css/daterangepicker.css",
				];
				const javascript = [
					"assets/js/validator.js",
					"assets/js/select2.js",
					"assets/js/moment.js",
					"assets/js/daterangepicker.js",
					"assets/js/app.js"
				];
				response.status(200);
				response.render("agent/add_order", {
					helper: request.helper,
					beforecss : beforestylesheets,
					js : javascript,
					css : stylesheets,
					brands : brands
				});
			}
		});	
	},

	async add_action_order(request, response, next){
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			const brands = await Brands_Model.find({});
			const beforestylesheets = [
				"assets/css/select2.css"
			];
			const stylesheets = [
				"assets/css/daterangepicker.css",
			];
			const javascript = [
				"assets/js/validator.js",
				"assets/js/select2.js",
				"assets/js/moment.js",
				"assets/js/daterangepicker.js",
				"assets/js/app.js"
			];
			response.status(400);
			response.render("agent/add_order", {
				helper: request.helper,
				beforecss : beforestylesheets,
				js : javascript,
				css : stylesheets,
				brands : brands,
				brand_id_error :  errors.mapped().brand_id,
				model_error    :  errors.mapped().model,
				status_error   :  errors.mapped().status,
				create_date_error :  errors.mapped().create_date,
				fault_error    :  errors.mapped().fault,
				customer_name_error    :  errors.mapped().customer_name,
				customer_phone_error :  errors.mapped().customer_phone
			});
		}else{
			const {brand_id, model, status, create_date, fault, customer_name, customer_phone, customer_email, customer_address} = request.body;

			let formated_date =  new Date(create_date);

			let Order = new Orders_Model({ 
				user_id : request.session.userId,
				brand_id : brand_id,
				order_reference : new RandomizerHelper.RandomizerHelpers().generate(),
				order_model : model,
				order_fault : fault,
				order_status : status,
				order_create_date : formated_date.toISOString(),
				order_customer_name : customer_name,
				order_customer_phone : customer_phone,
				order_customer_email : (typeof customer_email != "undefined") ? customer_email : "",
				order_customer_address :  (typeof customer_address != "undefined") ? customer_address : "",
			});
			await Order.save();
			response.status(201);
			request.flash('info', 'Order has been added successfuly');
			response.redirect(request.helper.base_url() +'agent/orders');
		}
	},
	async update_order(request, response, next){
		const order_id = request.params.order_id;
		const brands = await Brands_Model.find({});
		await Orders_Model.findById(order_id, function (error, _order) {
			if (error) return response.redirect(request.helper.base_url() +'agent/orders');
			const order = _order;
			const order_status = ["processing", "rejected", "completed", "repaired"];
			const beforestylesheets = [
				"assets/css/select2.css"
			];
			const stylesheets = [
				"assets/css/daterangepicker.css",
			];
			const javascript = [
				"assets/js/validator.js",
				"assets/js/select2.js",
				"assets/js/moment.js",
				"assets/js/daterangepicker.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("agent/update_order", {
				helper: request.helper,
				beforecss : beforestylesheets,
				js : javascript,
				css : stylesheets,
				brands : brands,
				order_status : order_status,
				order : order
			});
		});
	},

	async save_order(request, response, next){
		const errors = validationResult(request);
		const {order_id, brand_id, model, status, fault, amount, customer_name, customer_phone, customer_email, customer_address} = request.body;
		if (!errors.isEmpty()) {
			const order = await Orders_Model.findById(order_id);
			const brands = await Brands_Model.find({});
			const order_status = ["processing", "rejected", "completed", "repaired"];
			const beforestylesheets = [
				"assets/css/select2.css"
			];
			const stylesheets = [
				"assets/css/daterangepicker.css",
			];
			const javascript = [
				"assets/js/validator.js",
				"assets/js/select2.js",
				"assets/js/moment.js",
				"assets/js/daterangepicker.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("agent/update_order", {
				helper: request.helper,
				beforecss : beforestylesheets,
				css : stylesheets,
				js : javascript,
				brands : brands,
				order_status : order_status,
				order : order,
				brand_id_error :  errors.mapped().brand_id,
				model_error    :  errors.mapped().model,
				status_error   :  errors.mapped().status,
				fault_error    :  errors.mapped().fault,
				customer_name_error    :  errors.mapped().customer_name,
				customer_phone_error :  errors.mapped().customer_phone
			});
		}else{
			let QueryBuilder = {};
			QueryBuilder.order_amount = amount;
			QueryBuilder.order_status = status;

			await Orders_Model.findByIdAndUpdate(order_id, {
				order_amount : amount,
				order_status : status,
				order_customer_email : customer_email,
				order_customer_address : customer_address
			});
			response.status(200);
			request.flash('info', 'Orders has been updated successfuly');
			response.redirect(request.helper.base_url() +'agent/orders');
		}

	},
	async details_order(request, response, next){
		const order_id = request.params.order_id;
		const brands = await Brands_Model.find({});
		await Orders_Model.findById(order_id, function (error, _order) {
			if (error) return response.redirect(request.helper.base_url() +'agent/orders');
			const order = _order;
			const order_status = ["processing", "rejected", "completed", "repaired"];
			const beforestylesheets = [
				"assets/css/select2.css"
			];
			const stylesheets = [
				"assets/css/daterangepicker.css",
			];
			const javascript = [
				"assets/js/validator.js",
				"assets/js/select2.js",
				"assets/js/moment.js",
				"assets/js/daterangepicker.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("agent/details_order", {
				helper: request.helper,
				beforecss : beforestylesheets,
				js : javascript,
				css : stylesheets,
				brands : brands,
				order_status : order_status,
				order : order
			});
		});
	},
	async delete_order(request, response, next){
		const {order_id} = request.body;
		await Orders_Model.findByIdAndUpdate(order_id, {
			order_delete_request : true,
		});
		return response.status(200).json({
			type: "success",
			message : "Order has been deleted successfully"
		});
	},

	async subscription(request, response, next){
		const user = await User_Model.findById(mongoose.Types.ObjectId(request.session.userId));
		const subscriptions = await Subscription_Model.find({});
		const stylesheets = [
			"assets/css/app.css",
		];
		response.status(200);
		response.render("agent/subscription", {
			helper: request.helper,
			css : stylesheets,
			user : user,
			subscriptions : subscriptions
		});
	},

	async print_order(request, response, next){
		const order_id = request.params.order_id;
		await Orders_Model.findById(order_id, function (error, _order) {
			const order = _order;
			const invoice = {
				order_customer_name : order.order_customer_name,
				shipping: {
				  name: "John Doe",
				  address: "1234 Main Street",
				  city: "San Francisco",
				  state: "CA",
				  country: "US",
				  postal_code: 94111
				},
				items: [
				  {
					item: "TC 100",
					quantity: 2,
					amount: 6000
				  },
				  {
					item: "USB_EXT",
					quantity: 1,
					amount: 2000
				  }
				],
				subtotal: 8000,
				paid: 0,
				invoice_nr: 1234
			  };
	
			generate_pdf(request, response, "views/agent/print_order.ejs", invoice, "stream");
		});
	},
	async settings(request, response, next){
		const user = await User_Model.findById(mongoose.Types.ObjectId(request.session.userId)).populate("subscription_id");
		const javascript = [
			"assets/js/validator.js",
			"assets/js/app.js"
		];
		response.status(200);
		response.render("agent/settings", {
			helper: request.helper,
			js : javascript,
			user : user
		});
	},
	async save_settings(request, response, next){
		const errors = validationResult(request);
		const {first_name, last_name , email, phone, company, address, id} = request.body;

		if (!errors.isEmpty()) {
			let user = await  User_Model.findById({_id: id});		
			const subscriptions = await Subscription_Model.find({});	
			const javascript = [
				"assets/js/validator.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("agent/settings", {
				helper: request.helper,
				js : javascript,
				user   : user,
				subscriptions : subscriptions,
				first_name_error :  errors.mapped().first_name,
				last_name_error :   errors.mapped().last_name,
				email_error  :   errors.mapped().email,
				phone_error  :   errors.mapped().phone
			});
		}else{
			await User_Model.findByIdAndUpdate(id, {
				first_name   : request.helper.htmlEscaper(first_name),
				last_name    : request.helper.htmlEscaper(last_name),
				email        : email,
				phone        : request.helper.htmlEscaper(phone),
				company      : (company != undefined) ? request.helper.htmlEscaper(company) : "",
				address      : (address != undefined) ? address : ""
			}, {new: true}, function(err, res){
				if (err) return next(err);
				response.status(200);
				request.flash('info', 'Settings has been updated successfuly');
				response.redirect(request.helper.base_url() +'agent/settings');
			});
		}
	},
	async change_password(request, response, next){
		const user = await User_Model.findById(mongoose.Types.ObjectId(request.session.userId));
		const javascript = [
			"assets/js/validator.js",
			"assets/js/app.js"
		];
		response.status(200);
		response.render("agent/change_password", {
			helper: request.helper,
			js : javascript,
			user : user
		});
	},
	async save_password(request, response, next){
		const {password,  id} = request.body;
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			const user = await User_Model.findById(mongoose.Types.ObjectId(id));
			const javascript = [
				"assets/js/validator.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("agent/change_password", {
				helper: request.helper,
				user : user,
				js : javascript,
				password_error  :   errors.mapped().password,
				confirm_password_error  :   errors.mapped().confirm_password
			});
		}else{
			await User_Model.findOneAndUpdate({
				"_id": mongoose.Types.ObjectId(id),
			    },{ 
					$set: { 
						password: password
					} 
				},{
				new: true,
				fields: {
				  'password': 1
				}
			}).exec(function(error, data){
				if (error) return next(error);
				response.status(200);
				request.flash('info', 'Password has been changed successfuly');
				response.redirect(request.helper.base_url() +'agent/settings');
			});
		}

	},
	async plugins(request, response, next){
		get_all_plugins().then(function(plugin_list) {
			const stylesheets = [
				"assets/css/plugins.css",
			];
			response.status(200);
			response.render("agent/plugins", {
				helper: request.helper,
				css : stylesheets,
				plugin_list : plugin_list
			});
		}, function(err) {
			response.status(301);
			request.flash('danger', 'Something went wrong please try again later.');
			response.redirect(request.helper.base_url() +'agent/dashboard');
		});
	}
  
};
  
module.exports = AgentController;