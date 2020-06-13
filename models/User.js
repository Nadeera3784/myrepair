const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const _document_name = "User";

let UserSchema = mongoose.Schema({
    first_name : {
		type : String,
		required : true,
		lowercase: true,
		trim : true
    },
    last_name : {
		type : String,
		required : true,
		lowercase: true,
		trim : true
    },
	email : {
		type : String,
		required : true,
		lowercase: true,
		trim : true
	},
	phone : {
		type : String,
		required : true,
		trim : true
	},
	address  : {
		type : String,
		trim : true
	},
	company  : {
		type : String,
		trim : true
	},
	password : {
		type : String,
		required : true
	},
	isActive: {
		type: String,
		enum: ['0', '1'],
		default: '1',
	},
	role: {
		type: String,
		enum: ['admin', 'agent', 'user'],
	},
	subscription_id : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subscription'
	},
	accessToken: {
		type: String
	},
	createdAt: {
		type: Date,
		default: Date.now,
	}
});

UserSchema.pre('save', function (next) {
	var user = this;
	bcrypt.hash(user.password, 10, function (err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();
	})
});

UserSchema.pre("findOneAndUpdate", function(next) {
	const password = this.getUpdate().$set.password;
	if (typeof password == "undefined" && !password) {
		return next();
	}
	try {
		const salt = bcrypt.genSaltSync();
		const hash = bcrypt.hashSync(password, salt);
		this.getUpdate().$set.password = hash;
		next();
	} catch (error) {
		return next(error);
	}
});

UserSchema.static('findUserByID', function(id) {
	return new Promise((resolve, reject) => {
		mongoose.model(_document_name, UserSchema).findOne({_id : id}).exec(function (err, user){
		    if (err) reject(err)
		    resolve(user);
		});
    });
});

UserSchema.static('findUserByEmail', function(email) {
	return new Promise((resolve, reject) => {
		mongoose.model(_document_name, UserSchema).findOne({email : email}).exec(function (err, user){
		    if (err) reject(err)
		    resolve(user);
		});
    });
});

module.exports = mongoose.model(_document_name, UserSchema);


