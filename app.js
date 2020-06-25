const http       = require("http");
const path       = require("path");
const express    = require("express");
const bodyParser = require("body-parser");
const session    = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const logger     = require('morgan');
const flash      = require('express-flash');
const helmet     = require('helmet');
const cors       = require('cors');
const fs         = require('fs');
const CronJob    = require('cron').CronJob;
const htmlEscape = require('secure-filters').html;
require('express-async-errors');

const config_database  = require('./config/database.js');
const config_app       = require('./config/app.js');
const MongodbHelper    = require('./helpers/mongodb.js');
const LanguageHelper   = require('./helpers/language.js');
const moment           = require('./libraries/moment.js');
const {bill_payment_create, bill_due_payment_checker}  = require('./libraries/scheduler.js');
const {get_all_plugins} = require('./plugins/Plugin_interface.js');

const {app_route, user_route, admin_route, agent_route, auth_route}    = require('./routes');

var app = express();

let dir_base = __dirname;

let app_root = '/';

app.use(helmet());


if(config_app.app.environment == "development"){
app.use(logger('dev'));
}

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
	extended: true
}));


app.use(flash());

app.use(cors());

let store = new MongoStore({
	uri: config_database.database.hostname,
	collection: 'sessions'
});

app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: 'pAgGxo8Hzg7PFlv1HpO8Eg0Y6xtP7zYx',
	cookie: {
		path: '/',
		httpOnly: true,
		maxAge: 3600000 * 24
	},
	store: store
		
}));

new MongodbHelper.MongoHelpers().Initialize(config_database.database.hostname);

app.set("view engine", "ejs");

app.set('views', path.join(dir_base, 'views'));

app.set('view options', { layout: false });

app.use(express.static(path.join(dir_base, 'public')));

let helper = {
	language : function (value) {
		return new LanguageHelper.LanguageHelpers().GetLine().__(value);
	},
	app_root : function(){
		return app_root;
	},
	base_url : function(){
		return config_app.app.base_url;
	},
	initial_capitalizer : function(string){
	  return string[0].toUpperCase() +  string.slice(1); 
	},
	date_format : function(date, format='MM/DD/YYYY'){
	  return moment(date).format(format);
	},
	truncate : function(str, len){
		if (str.length > len){
           return str.substring(0,5) + '...';
		}else{
	      return str;
		}
	},
	htmlEscaper : function (str){
		return htmlEscape(str);
	}

};

app.use(function (request, response, next) {;
    request.helper   = helper;
	next();
});

app.use(function(request, response, next) {
	response.locals.session = request.session;
	next();
});

app.use((request, response, next) => {
    response.setHeader('Cache-Control', 'no-cache, no-store');
    next();
});


const job = new CronJob('1 * * * * *', function() {
 	console.log('You will see this message every 1 second');
    //bill_payment_create();
    //bill_due_payment_checker();
 }, null, true, 'Asia/Colombo');
//job.start();

get_all_plugins().then(function(plugin_list) {
	plugin_list.forEach(function(pluginName){
		var plugin = require('./plugins/'+pluginName.plugin.name);
		if (typeof plugin.loader !== 'function') return;
		plugin.loader({
			app :  app
		});
	});
}, function(err) {
	console.log(err);
});


		

app.use('/', app_route);
app.use('/', auth_route);
app.use('/', admin_route);
app.use('/', agent_route);
app.use('/', user_route);
app.disable('x-powered-by');

// app.use((request, response, next) => {
//     const err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });



app.set('port', process.env.PORT || 3030);

http.createServer(app).listen(app.get('port'), function () {
	console.log("Express server listening on port " + app.get('port'));
});

module.exports = app;
