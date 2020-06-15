const {validationResult } = require('express-validator');
const debug = require('eyes').inspector({styles: {all: 'cyan'}});
const path    = require('path');
const fs      = require('fs');
const slugify = require('slugify')
const bcrypt = require('bcryptjs');

const {User_Model, Subscription_Model, Brands_Model, Announcements_Model, Orders_Model, Bill_Model} = require('../models');
const config_app       = require('../config/app.js');

const AdminController = {

	async index(request, response, next){
		response.status(200);
		response.render("admin/dashboard", {
			helper: request.helper
		});
	},

	async users(request, response, next){
		const users = await User_Model.find({}).populate('subscription_id');
		const beforestylesheets = [
			"assets/css/select2.css"
		];
		const stylesheets = [
			"assets/css/jquery.dataTables.min.css",
			"assets/css/responsive.dataTables.min.css",
			"assets/css/dialog.css",
		];
		const javascript = [
			"assets/js/jquery.dataTables.min.js",
			"assets/js/responsive.dataTables.min.js",
			"assets/js/dataTables.bootstrap.min.js",
			"assets/js/select2.js",
			"assets/js/dialog.js",
			"assets/js/app.js",
		];
		response.status(200);
		response.render("admin/users", {
			helper: request.helper,
			css : stylesheets,
			beforecss : beforestylesheets,
			js : javascript,
			users : users
		});
	},
	async add_user(request, response, next){
		const subscriptions = await Subscription_Model.find({});
		const beforestylesheets = [
			"assets/css/select2.css"
		];
		const javascript = [
			"assets/js/validator.js",
			"assets/js/select2.js",
			"assets/js/app.js"
		];
		response.status(200);
		response.render("admin/add_user", {
			helper: request.helper,
			js : javascript,
			beforecss : beforestylesheets,
			subscriptions : subscriptions
		});
	},
	async add_action_user(request, response, next){
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			const subscriptions = await Subscription_Model.find({});
			const javascript = [
				"assets/js/validator.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("admin/add_user", {
				helper: request.helper,
				js : javascript,
				subscriptions : subscriptions,
				first_name_error :  errors.mapped().first_name,
				last_name_error :   errors.mapped().last_name,
				password_error  :   errors.mapped().password,
				confirm_password_error  :   errors.mapped().confirm_password,
				email_error  :   errors.mapped().email,
				phone_error  :   errors.mapped().phone,
				subscription_id  :   errors.mapped().subscription_id,
				role_error  :   errors.mapped().role
			});  
		}else{
			const {first_name, last_name, password , email, phone, role, subscription_id} = request.body;

			let User =  User_Model({
				first_name   : first_name,
				last_name  : last_name,
				email : email,
				phone : phone,
				password :  password,
				role : role,
				subscription_id : subscription_id
			});

			await User.save();
			response.status(200);
			request.flash('info', 'User has been added successfuly');
			response.redirect(request.helper.base_url() +'admin/users');
		}
	},
	async update_user(request, response, next){
		const user_id = request.params.user_id;
		let user = await  User_Model.findById({_id: user_id});
		const subscriptions = await Subscription_Model.find({});
		const javascript = [
			"assets/js/validator.js",
			"assets/js/app.js"
		];
		response.status(200);
		response.render("admin/update_user", {
			helper: request.helper,
			js : javascript,
			user   : user,
			subscriptions : subscriptions
		});
	},
	async save_user(request, response, next){
		const errors = validationResult(request);
		const {first_name, last_name , email, phone, company, address, role, subscription_id, statush,  id} = request.body;

		if (!errors.isEmpty()) {
			let user = await  User_Model.findById({_id: id});		
			const subscriptions = await Subscription_Model.find({});	
			const javascript = [
				"assets/js/validator.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("admin/update_user", {
				helper: request.helper,
				js : javascript,
				user   : user,
				subscriptions : subscriptions,
				first_name_error :  errors.mapped().first_name,
				last_name_error :   errors.mapped().last_name,
				email_error  :   errors.mapped().email,
				phone_error  :   errors.mapped().phone,
				subscription_id  :   errors.mapped().subscription_id,
				role_error  :   errors.mapped().role
			});
		}else{
			await User_Model.findByIdAndUpdate(id, {
				first_name   : first_name,
				last_name    : last_name,
				email        : email,
				phone        : phone,
				company      : (company != undefined) ? request.helper.htmlEscaper(company) : "",
				address      : (address != undefined) ? address : "",
				role         : role,
				subscription_id : subscription_id,
				isActive  : (statush == "on") ? 1 : 0, 
			}, {new: true}, function(err, res){
				if (err) return next(err);
				response.status(200);
				request.flash('info', 'User has been updated successfuly');
				response.redirect(request.helper.base_url() +'admin/users');
			});
		}
	},
	async force_password_change(request, response, next){
		 const user_id = request.params.user_id;
		 const javascript = [
			"assets/js/validator.js",
			"assets/js/app.js"
		];
		response.status(200);
		response.render("admin/force_password_change", {
			helper: request.helper,
			user_id : user_id,
			js : javascript,
		});
	},
	async save_force_password_change(request, response, next){
		const {password,  id} = request.body;
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			const javascript = [
				"assets/js/validator.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("admin/force_password_change", {
				helper: request.helper,
				user_id : id,
				js : javascript,
				password_error  :   errors.mapped().password,
				confirm_password_error  :   errors.mapped().confirm_password
			});
		}else{
			const salt = bcrypt.genSaltSync();
			const hash = bcrypt.hashSync(password, salt);
			await User_Model.findByIdAndUpdate(id, {
				password   : hash, 
			}, {new: true}, function(err, res){
				if (err) return next(err);
				response.status(200);
				request.flash('info', 'Password has been changed successfuly');
				response.redirect(request.helper.base_url() +'admin/users');
			});
		}

	},
	async delete_user(request, response, next){
		const {user_id} = request.body;
		await User_Model.deleteOne({ _id: user_id }, {});
		response.status(200).json({
			type  : "success",
			message: "User has been deleted successfully"
		});
	},
	async subscription(request, response, next){
		const subscriptions = await Subscription_Model.find({});
		const stylesheets = [
			"assets/css/jquery.dataTables.min.css",
			"assets/css/responsive.dataTables.min.css",
			"assets/css/dialog.css",
		];
		const javascript = [
			"assets/js/jquery.dataTables.min.js",
			"assets/js/responsive.dataTables.min.js",
			"assets/js/dataTables.bootstrap.min.js",
			"assets/js/dialog.js",
			"assets/js/app.js",
		];
		response.status(200);
		response.render("admin/subscription", {
			helper: request.helper,
			css : stylesheets,
			js : javascript,
			subscriptions : subscriptions
		});
	},
	async add_subscription(request, response, next){
		const javascript = [
			"assets/js/validator.js",
			"assets/js/app.js"
		];
		response.status(200);
		response.render("admin/add_subscription", {
			helper: request.helper,
			js : javascript,
		});
	},
	async add_action_subscription(request, response, next){
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			response.status(400);
			response.render("admin/add_subscription", {
				helper: request.helper,
				title_error :  errors.mapped().title,
				limit_error :  errors.mapped().limit,
				price_error :  errors.mapped().price
			});
		}else{
			const {title, limit, price} = request.body;

			let Subscription = new Subscription_Model({ 
				subscription_title : title,
				subscription_limit : limit,
				subscription_price : price
			});
			await Subscription.save();
			response.status(201);
			request.flash('info', 'Subscription has been added successfuly');
			response.redirect(request.helper.base_url() +'admin/subscription');
		}
	},
	async update_subscription(request, response, next){
		const subscription_id = request.params.subscription_id;
		await Subscription_Model.findById(subscription_id, function (error, _subscription) {
			if (error) return response.redirect(request.helper.base_url() +'admin/subscription');
			const subscription = _subscription;
			response.status(200);
			response.render("admin/update_subscription", {
				helper: request.helper,
				subscription : subscription
			});
		});
	},
	async save_subscription(request, response, next){
		const errors = validationResult(request);
		const {subscription_id, title, limit, price} = request.body;
		if (!errors.isEmpty()) {
			const subscription = await Subscription_Model.findById(subscription_id);
			response.status(200);
			response.render("admin/update_subscription", {
				helper: request.helper,
				subscription : subscription,
				title_error :  errors.mapped().title,
				limit_error :  errors.mapped().limit,
				price_error :  errors.mapped().price
			});
		}else{
			await Subscription_Model.findByIdAndUpdate(subscription_id, {
				subscription_title : title,
				subscription_limit : limit,
				subscription_price : price
			});
			response.status(200);
			request.flash('info', 'Subscription has been updated successfuly');
			response.redirect(request.helper.base_url() +'admin/subscription');
		}

	},
	async delete_subscription(request, response, next){
		const {subscription_id} = request.body;
		await Subscription_Model.findByIdAndDelete(subscription_id, function (error){
			if (error){
				return response.status(400).json({
					type: "error",
					message : "Something went wrong please try again"
				});
			}
			return response.status(200).json({
				type: "success",
				message : "Subscription has been deleted successfully"
			});
		});

	},
	async brands(request, response, next){
		const brands = await Brands_Model.find({});
		const stylesheets = [
			"assets/css/jquery.dataTables.min.css",
			"assets/css/responsive.dataTables.min.css",
			"assets/css/dialog.css",
		];
		const javascript = [
			"assets/js/jquery.dataTables.min.js",
			"assets/js/responsive.dataTables.min.js",
			"assets/js/dataTables.bootstrap.min.js",
			"assets/js/dialog.js",
			"assets/js/app.js",
		];
		response.status(200);
		response.render("admin/brands", {
			helper: request.helper,
			css : stylesheets,
			js : javascript,
			brands : brands
		});
	},
	async add_brand(request, response, next){
		const javascript = [
			"assets/js/validator.js",
			"assets/js/app.js"
		];
		response.status(200);
		response.render("admin/add_brand", {
			helper: request.helper,
			js : javascript
		});
	},
	async add_action_brand(request, response, next){
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			response.status(400);
			response.render("admin/add_brand", {
				helper: request.helper,
				name_error :  errors.mapped().name
			});
		}else{
			const {name} = request.body;

			let Brand = new Brands_Model({ 
				brand_name : name
			});
			await Brand.save();
			response.status(201);
			request.flash('info', 'Brand has been added successfuly');
			response.redirect(request.helper.base_url() +'admin/brands');
		}
	},
	async update_brand(request, response, next){
		const brand_id = request.params.brand_id;
		await Brands_Model.findById(brand_id, function (error, _brand) {
			if (error) return response.redirect(request.helper.base_url() +'admin/brands');
			const brand = _brand;
			const javascript = [
				"assets/js/validator.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("admin/update_brand", {
				helper: request.helper,
				js : javascript,
				brand : brand
			});
		});
	},
	async save_brand(request, response, next){
		const errors = validationResult(request);
		const {brand_id, name} = request.body;
		if (!errors.isEmpty()) {
			const brand = await Brands_Model.findById(brand_id);
			const javascript = [
				"assets/js/validator.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("admin/update_brand", {
				helper: request.helper,
				js : javascript,
				brand : brand,
				name_error :  errors.mapped().name
			});
		}else{
			await Brands_Model.findByIdAndUpdate(brand_id, {
				brand_name : name
			});
			response.status(200);
			request.flash('info', 'Brand has been updated successfuly');
			response.redirect(request.helper.base_url() +'admin/brands');
		}

	},
	async delete_brand(request, response, next){
		const {brand_id} = request.body;
		await Brands_Model.findByIdAndDelete(brand_id, function (error){
			if (error){
				return response.status(400).json({
					type: "error",
					message : "Something went wrong please try again"
				});
			}
			return response.status(200).json({
				type: "success",
				message : "Brand has been deleted successfully"
			});
		});

	},
	async announcements(request, response, next){
		const announcements = await Announcements_Model.find({});
		const stylesheets = [
			"assets/css/jquery.dataTables.min.css",
			"assets/css/responsive.dataTables.min.css",
			"assets/css/dialog.css",
		];
		const javascript = [
			"assets/js/jquery.dataTables.min.js",
			"assets/js/responsive.dataTables.min.js",
			"assets/js/dataTables.bootstrap.min.js",
			"assets/js/dialog.js",
			"assets/js/app.js",
		];
		response.status(200);
		response.render("admin/announcements", {
			helper: request.helper,
			css : stylesheets,
			js : javascript,
			announcements : announcements
		});
	},
	async add_announcements(request, response, next){
		const users = await User_Model.find({role: 'agent'});
		const beforestylesheets = [
			"assets/css/select2.css"
		];
		const javascript = [
			"assets/js/validator.js",
			"assets/js/select2.js",
			"assets/js/app.js"
		];
		response.status(200);
		response.render("admin/add_announcements", {
			helper: request.helper,
			beforecss : beforestylesheets,
			js : javascript,
			users : users
		});
	},
	async add_action_announcements(request, response, next){
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			const users = await User_Model.find({role: 'agent'});
			const beforestylesheets = [
				"assets/css/select2.css"
			];
			const javascript = [
				"assets/js/validator.js",
				"assets/js/select2.js",
				"assets/js/app.js"
			];
			response.status(400);
			response.render("admin/add_announcements", {
				beforecss : beforestylesheets,
				js : javascript,
				users : users,
				helper: request.helper,
				title_error :  errors.mapped().title,
				announcement_type_error :  errors.mapped().announcement_type,
				description_error :  errors.mapped().description
			});
		}else{
			const {title, announcement_type, description, user_id} = request.body;

			let QueryBuilder = {};
			QueryBuilder.announcement_title = title;
			QueryBuilder.announcement_type = announcement_type;
			if(user_id != undefined){
			   QueryBuilder.announcement_users = user_id.toString();
		    }
			QueryBuilder.announcement_description = description;
			
			let Announcement = new Announcements_Model(QueryBuilder);
			await Announcement.save();
			response.status(201);
			request.flash('info', 'Announcement has been added successfuly');
			response.redirect(request.helper.base_url() +'admin/announcements');
		}
	},
	async update_announcement(request, response, next){
		const announcement_id = request.params.announcement_id;
		const users = await User_Model.find({role: 'agent'});
		await Announcements_Model.findById(announcement_id, function (error, _announcement) {
			if (error) return response.redirect(request.helper.base_url() +'admin/announcements');
			const announcement = _announcement;
			const types = ["public", "private"];
			const beforestylesheets = [
				"assets/css/select2.css"
			];
			const javascript = [
				"assets/js/validator.js",
				"assets/js/select2.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("admin/update_announcement", {
				helper: request.helper,
				beforecss : beforestylesheets,
				js : javascript,
				announcement : announcement,
				types : types,
				users : users
			});
		});
	},
	async save_announcements(request, response, next){
		const errors = validationResult(request);
		const {announcement_id, title, announcement_type, description, user_id} = request.body;
		if (!errors.isEmpty()) {
			const announcement = await Announcements_Model.findById(announcement_id);
			const users = await User_Model.find({role: 'agent'});
			const types = ["public", "private"];
			const beforestylesheets = [
				"assets/css/select2.css"
			];
			const javascript = [
				"assets/js/validator.js",
				"assets/js/select2.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("admin/update_announcement", {
				helper: request.helper,
				beforecss : beforestylesheets,
				js : javascript,
				announcement : announcement,
				users : users,
				types : types,
				title_error :  errors.mapped().title,
				announcement_type_error :  errors.mapped().announcement_type,
				description_error :  errors.mapped().description
			});
		}else{
			let QueryBuilder = {};
			QueryBuilder.announcement_title = title;
			QueryBuilder.announcement_type = announcement_type;
			if(user_id != undefined){
			   QueryBuilder.announcement_users = user_id.toString();
		    }
			QueryBuilder.announcement_description = description;
			
			await Announcements_Model.findByIdAndUpdate(announcement_id, QueryBuilder);
			response.status(200);
			request.flash('info', 'Announcements has been updated successfuly');
			response.redirect(request.helper.base_url() +'admin/announcements');
		}

	},
	async delete_announcement(request, response, next){
		const {announcement_id} = request.body;
		await Announcements_Model.findByIdAndDelete(announcement_id, function (error){
			if (error){
				return response.status(400).json({
					type: "error",
					message : "Something went wrong please try again"
				});
			}
			return response.status(200).json({
				type: "success",
				message : "Announcement has been deleted successfully"
			});
		});

	},
	async orders(request, response, next){
		const brands = await Brands_Model.find({});
		const users = await User_Model.find({role: 'agent'});
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
			"assets/js/daterangepicker.js",
			"assets/js/dialog.js",
			"assets/js/app.js",
		];
		response.status(200);
		response.render("admin/orders", {
			helper: request.helper,
			css : stylesheets,
			beforecss : beforestylesheets,
			js : javascript,
			brands : brands,
			users : users
		});
	},
	async details_order(request, response, next){
		const order_id = request.params.order_id;
		const brands = await Brands_Model.find({});
		await Orders_Model.findById(order_id, function (error, _order) {
			if (error) return response.redirect(request.helper.base_url() +'admin/orders');
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
			response.render("admin/details_order", {
				helper: request.helper,
				beforecss : beforestylesheets,
				js : javascript,
				css : stylesheets,
				brands : brands,
				order_status : order_status,
				order : order
			});
		}).populate('user_id');
	},
	async update_order(request, response, next){
		const order_id = request.params.order_id;
		const brands = await Brands_Model.find({});
		await Orders_Model.findById(order_id, function (error, _order) {
			if (error) return response.redirect(request.helper.base_url() +'admin/orders');
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
			response.render("admin/update_order", {
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
			response.render("admin/update_order", {
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
				amount_error   :  errors.mapped().amount,
				fault_error    :  errors.mapped().fault,
				customer_name_error    :  errors.mapped().customer_name,
				customer_phone_error :  errors.mapped().customer_phone
			});
		}else{
			await Orders_Model.findByIdAndUpdate(order_id, {
				brand_id : brand_id,
				order_model : model,
				order_fault : fault,
				order_amount : amount,
				order_status : status,
				order_customer_name : customer_name,
				order_customer_phone : customer_phone,
				order_customer_email : customer_email,
				order_customer_address : customer_address
			});
			response.status(200);
			request.flash('info', 'Orders has been updated successfuly');
			response.redirect(request.helper.base_url() +'admin/orders');
		}

	},
	async delete_order(request, response, next){
		const {order_id} = request.body;
		await Orders_Model.findByIdAndDelete(order_id, function (error){
			if (error){
				return response.status(400).json({
					type: "error",
					message : "Something went wrong please try again"
				});
			}
			return response.status(200).json({
				type: "success",
				message : "Order has been deleted successfully"
			});
		});

	},
	async billing(request, response, next){
		const users = await User_Model.find({role: 'agent'});
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
			"assets/js/moment.js",
			"assets/js/daterangepicker.js",
			"assets/js/select2.js",
			"assets/js/dialog.js",
			"assets/js/app.js",
		];
		response.status(200);
		response.render("admin/billing", {
			helper: request.helper,
			js : javascript,
			beforecss : beforestylesheets,
			css : stylesheets,
			users : users
		});
	},
	async delete_bill(request, response, next){
		const {bill_id} = request.body;
		await Bill_Model.findByIdAndDelete(bill_id, function (error){
			if (error){
				return response.status(400).json({
					type: "error",
					message : "Something went wrong please try again"
				});
			}
			return response.status(200).json({
				type: "success",
				message : "Bill has been deleted successfully"
			});
		});

	},
	async update_bill(request, response, next){
		const bill_id = request.params.bill_id;
		await Bill_Model.findById(bill_id, function (error, _bill) {
			if (error) return response.redirect(request.helper.base_url() +'admin/billing');
			const bill = _bill;
			const stylesheets = [
				"assets/css/daterangepicker.css",
			];
			const javascript = [
				"assets/js/validator.js",
				"assets/js/moment.js",
				"assets/js/daterangepicker.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("admin/update_bill", {
				helper: request.helper,
				js : javascript,
				css : stylesheets,
				bill : bill
			});
		});
	},
	async details_bill(request, response, next){
		const bill_id = request.params.bill_id;
		await Bill_Model.findById(bill_id, function (error, _bill) {
			if (error) return response.redirect(request.helper.base_url() +'admin/billing');
			const bill = _bill;
			const stylesheets = [
				"assets/css/daterangepicker.css",
			];
			const javascript = [
				"assets/js/validator.js",
				"assets/js/moment.js",
				"assets/js/daterangepicker.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("admin/details_bill", {
				helper: request.helper,
				js : javascript,
				css : stylesheets,
				bill : bill
			});
		}).populate('user_id');
	},
	async save_bill(request, response, next){
		const {payment_method, transaction_id, update_date, status, bill_id} = request.body;
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			const bill = await Bill_Model.findById(mongoose.Types.ObjectId(bill_id));
			
			const stylesheets = [
				"assets/css/daterangepicker.css",
			];
			const javascript = [
				"assets/js/validator.js",
				"assets/js/moment.js",
				"assets/js/daterangepicker.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("admin/update_bill", {
				helper: request.helper,
				js : javascript,
				css : stylesheets,
				payment_method_error  :   errors.mapped().payment_method,
				transaction_id_error  :   errors.mapped().transaction_id,
				update_date_error     :   errors.mapped().update_date,
				bill : bill
			});
		}else{
			var formatted_end_date =  new Date(update_date);

			let QueryBuilder = {};
			QueryBuilder.bill_update_date = formatted_end_date;
			if(payment_method != " "){
				QueryBuilder.bill_payment_method = request.helper.htmlEscaper(payment_method);
			}
			if(transaction_id != " "){
				QueryBuilder.bill_transaction_id = transaction_id;
			}
			if(status != " "){
				QueryBuilder.bill_status = status;
			}

			await Bill_Model.findByIdAndUpdate(bill_id, QueryBuilder, {new: true, useFindAndModify: false}, function(err, res){
				if (err) return next(err);
				response.status(200);
				request.flash('info', 'Bill has been updated successfuly');
				response.redirect(request.helper.base_url() +'admin/billing');
			});
		}

	},
};
  
module.exports = AdminController;
  