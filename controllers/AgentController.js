const {validationResult } = require('express-validator');
const debug = require('eyes').inspector({styles: {all: 'cyan'}});
const path    = require('path');
const fs      = require('fs');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Excel = require('exceljs');
const tempfile = require('tempfile');
const moment = require('../libraries/moment.js');

const {User_Model, Announcements_Model, Brands_Model, Orders_Model, Subscription_Model, Bill_Model} = require('../models');
const config_app        = require('../config/app.js');
const {get_all_plugins} = require('../plugins/Plugin_interface.js');
const RandomizerHelper  = require('../helpers/randomizer.js');
const {generate_pdf}  = require('../libraries/pdf.js');
const { concatSeries } = require('async');

const AgentController = {

	async index(request, response, next){
		const user_private_announcements = await Announcements_Model.find({
			"announcement_users": {
				 "$in": [request.session.userId]
			}
		});

		const public_announcements = await Announcements_Model.find({ announcement_type : "public"});
		const javascript = [
			"assets/js/raphael.js",
			"assets/js/morris.js",
			"assets/js/app.js"
		];
		const agent_orders = await Orders_Model.find({
			user_id: mongoose.Types.ObjectId(request.session.userId),
			order_create_date: { 
				$gte: moment().startOf('month').format("YYYY-MM-DD"), 
				$lte: moment().endOf('month').format("YYYY-MM-DD") 
			}
		});

		const agent_orders_phones = await Orders_Model.countDocuments({
			user_id: mongoose.Types.ObjectId(request.session.userId),
			order_create_date: { 
				$gte: moment().startOf('month').format("YYYY-MM-DD"), 
				$lte: moment().endOf('month').format("YYYY-MM-DD") 
			}
		});

		var agent_current_month_earning_total = 0;
		agent_orders.forEach(function(am){  
			agent_current_month_earning_total = agent_current_month_earning_total +  am.order_amount;
		});


		response.status(200);
		response.render("agent/dashboard", {
			helper: request.helper,
			user_private_announcements : user_private_announcements,
			public_announcements : public_announcements,
			agent_current_month_earning_total : agent_current_month_earning_total,
			agent_orders_phones : agent_orders_phones,
			js : javascript
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
		const user = await User_Model.findById(mongoose.Types.ObjectId(request.session.userId)).populate('subscription_id');
		if(typeof user.payment_block != "undefined" && user.payment_block == true){
			response.status(201);
			request.flash('danger', 'Please settle your outstanding bill payment');
			response.redirect(request.helper.base_url() +'agent/orders');	
		}
		const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
		const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD');
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
		const user = await User_Model.findById(mongoose.Types.ObjectId(request.session.userId));
		if(typeof user.payment_block != "undefined" && user.payment_block == true){
			response.status(201);
			request.flash('danger', 'Please settle your outstanding bill payment');
			response.redirect(request.helper.base_url() +'agent/orders');	
		}
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
				invoice_description : order.order_fault,
				invoice_amount : order.order_amount,
				invoice_date: moment().format('DD-MMMM-YYYY'),
				invoice_id : "#"+order.order_reference
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
			const salt = bcrypt.genSaltSync();
			const hash = bcrypt.hashSync(password, salt);
			await User_Model.findOneAndUpdate({
				"_id": mongoose.Types.ObjectId(id),
			    },{ 
					$set: { 
						password: hash
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
	async billing(request, response, next){
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
			"assets/js/dialog.js",
			"assets/js/app.js",
		];
		response.status(200);
		response.render("agent/billing", {
			helper: request.helper,
			js : javascript,
			css : stylesheets
		});
	},
	async update_bill(request, response, next){
		const bill_id = request.params.bill_id;
		await Bill_Model.findById(bill_id, function (error, _bill) {
			if (error) return response.redirect(request.helper.base_url() +'agent/billing');
			const bill = _bill;
			const javascript = [
				"assets/js/validator.js",
				"assets/js/moment.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("agent/update_bill", {
				helper: request.helper,
				js : javascript,
				bill : bill
			});
		});
	},
	async details_bill(request, response, next){
		const bill_id = request.params.bill_id;
		await Bill_Model.findById(bill_id, function (error, _bill) {
			if (error) return response.redirect(request.helper.base_url() +'agent/billing');
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
			response.render("agent/details_bill", {
				helper: request.helper,
				js : javascript,
				css : stylesheets,
				bill : bill
			});
		}).populate('user_id');
	},
	async save_bill(request, response, next){
		const {payment_method, transaction_id, bill_id} = request.body;
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			const bill = await Bill_Model.findById(mongoose.Types.ObjectId(bill_id));
			const javascript = [
				"assets/js/validator.js",
				"assets/js/moment.js",
				"assets/js/app.js"
			];
			response.status(200);
			response.render("agent/update_bill", {
				helper: request.helper,
				js : javascript,
				payment_method_error  :   errors.mapped().payment_method,
				transaction_id_error  :   errors.mapped().transaction_id,
				bill : bill
			});
		}else{
			await Bill_Model.findByIdAndUpdate(bill_id, {
				bill_payment_method   : request.helper.htmlEscaper(payment_method),
				bill_transaction_id   : transaction_id,
				bill_update_date      : new Date(),
				bill_status           : "processing",
			}, {new: true, useFindAndModify: false}, function(err, res){
				if (err) return next(err);
				response.status(200);
				request.flash('info', 'Bill has been updated successfuly');
				response.redirect(request.helper.base_url() +'agent/billing');
			});
		}

	},
	async agent_week_report(request, response, next){
		var currentDate = moment();

		var weekStart = currentDate.startOf('week');
		
		var weekEnd = currentDate.endOf('week');
		
		var days_array = [];
	
		for (i = 0; i <= 6; i++) {
			days_array.push(moment(weekStart).add(i, 'days').format("MMM-D"));
		}
	
		var data = {};
	
		data['weekdata'] = [];
	
		days_array.forEach( function(sd, index){
	
			data['weekdata'][index] = {
				"date" : sd,
			};
			data['weekdata'][index]['booking'] = "12";
		});
	
		response.status(200).json({
			message : data
		});
	},
	async agent_month_report(request, response, next){

		var currentDate = moment();
		
		var weekStart = currentDate.startOf('month');
		
		var weekEnd = currentDate.endOf('month');
		
		var days_array = [];
		
		var current_month_days = moment().daysInMonth();

		for (i = 0; i <= current_month_days; i++) {
			days_array.push(moment(weekStart).add(i, 'days').format("YYYY-MM-DD"));
		}
	
		var data = {};
	
		data['weekdata'] = [];
	
		// days_array.forEach( function(sd, index){
	
		// 	data['weekdata'][index] = {
		// 		"date" : sd,
		// 	};
		// 	data['weekdata'][index]['booking'] = "12";
		// 		//days_array.push(moment(yearStart).add(i, 'months').format("MMM"));
		// });

		for (i = 0; i <= days_array.length ; i++) { 
			// var month_count = await Orders_Model.countDocuments({
			// 	"user_id" : mongoose.Types.ObjectId(request.session.userId),
			// 	"order_create_date" : days_array[i]
			// });


			data['weekdata'][i] = {
				"date" : days_array[i],
			};

			// data['weekdata'][i] = {
			// 	"date" :  moment(days_array[i]).format('MMM'),
			// };

			data['weekdata'][i]['booking'] = '12';

		}
		console.log('data', data);;

		response.status(200).json({
			message : data
		});
	},
	async agent_year_report(request, response, next){

		var currentDate = moment();
		
		var yearStart = currentDate.startOf('year');
		
		var yearEnd = currentDate.endOf('year');
		
		var days_array = [];

		var m = moment();

		for (i = 0; i <= 11 ; i++) {
			days_array.push(m.month(i).format('YYYY-MM-DD'));
		}

		var data = {};
	
		data['yeardata'] = [];
	
	    for (i = 0; i <= days_array.length ; i++) { 
			var month_start = moment(days_array[i]).startOf('month');
			var month_end = moment(days_array[i]).endOf('month');
			var month_count = await Orders_Model.countDocuments({
				"user_id" : mongoose.Types.ObjectId(request.session.userId),
				"order_create_date" : {
					'$gte': moment(month_start).format("YYYY-MM-DD"), 
					'$lte': moment(month_end).format("YYYY-MM-DD")
				}
			});
			data['yeardata'][i] = {
				"date" :  moment(days_array[i]).format('MMM'),
			};
		    data['yeardata'][i]['booking'] = month_count;
		}
	
		response.status(200).json({
			message : data
		});


	},
	async agent_export_orders(request, response, next){
		var workbook = new Excel.Workbook();
		var worksheet = workbook.addWorksheet('My Sheet');
		// worksheet.columns = [
        //     { header: 'Id', key: 'id', width: 10 },
        //     { header: 'Name', key: 'name', width: 20 },
        //     { header: 'DOB.', key: 'dob', width: 10, style: { numFmt: 'dd/mm/yyyy' }}
        // ];
        // worksheet.addRow({
		// 	id: 1, 
		// 	name: 'John Doe', 
		// 	dob: moment().format("DD/MM/YYYY")
		// });
		// worksheet.addRow({
		// 	id: 2, 
		// 	name: 'Jane Doe', 
		// 	dob: moment().format("DD/MM/YYYY")
		// });
		worksheet.columns = [
			{ header: 'order_reference', key: 'order_reference', width: 8 },
			{ header: 'brand_id.', key: 'brand_id', width: 25},
			{ header: 'order_model', key: 'order_model', width: 5 },
			{ header: 'user_id', key: 'user_id', width: 25 },
			{ header: 'order_amount', key: 'order_amount', width: 10 },
			{ header: 'order_fault', key: 'order_fault', width: 20 },
			{ header: 'order_status', key: 'order_status', width: 10 },
			{ header: 'order_delete_request', key: 'order_delete_request', width: 5 },
			{ header: 'order_create_date', key: 'order_create_date', width: 10 , style: { numFmt: 'dd/mm/yyyy' }},
			{ header: 'order_customer_name', key: 'order_customer_name', width: 20 },
			{ header: 'order_customer_phone', key: 'order_customer_phone', width: 10 },
			{ header: 'order_customer_email', key: 'order_customer_email', width: 15 },
			{ header: 'order_customer_address', key: 'order_customer_address', width: 30 },
		];

		var daterange = request.body.daterange || "";

		var searchStr = '';

		if(daterange != ''){
			var date_array = daterange.split("-");
			var start_date =  request.helper.date_format(new Date(date_array[0]), "YYYY-MM-DD");
			var end_date   =  request.helper.date_format(new Date(date_array[1]), "YYYY-MM-DD");
			var formatted_start_date =  moment.utc(start_date).format();
			var formatted_end_date =  moment.utc(end_date).format();
			searchStr = { 
				'order_create_date': { $gt: formatted_start_date, $lt: formatted_end_date},
				'user_id' : mongoose.Types.ObjectId(request.session.userId)
			};
		}else{
			 searchStr = {
				'user_id' : mongoose.Types.ObjectId(request.session.userId)
			 };
		}
	

		const orders = await Orders_Model.find(searchStr);
        orders.forEach(function(order){
			worksheet.addRow({
				order_reference: order.order_reference, 
				brand_id: order.brand_id, 
				order_model: order.order_model, 
				user_id: order.user_id, 
				order_amount: order.order_amount, 
				order_fault: order.order_fault, 
				order_status: order.order_status, 
				order_delete_request: order.order_delete_request, 
				order_create_date: moment(order.order_create_date).format("DD/MM/YYYY"),
				order_customer_name: order.order_customer_name, 
				order_customer_phone: order.order_customer_phone, 
				order_customer_email: order.order_customer_email, 
				order_customer_address: order.order_customer_address, 
            });
		});
		var tempFilePath = tempfile('.xlsx');
        // workbook.xlsx.writeFile(tempFilePath).then(function() {
		// 	response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		// 	response.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
		// 	response.end();

        //     // response.sendFile(tempFilePath, function(err){
        //     //     console.log('---------- error downloading file: ' + err);
        //     // });
		// });
		
		workbook.xlsx.writeFile(tempFilePath).then(function() {
			response.download(tempFilePath);
			//response.sendFile(tempFilePath);
		});
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