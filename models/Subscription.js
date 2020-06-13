const mongoose = require('mongoose');

const _document_name = "Subscription";

let SubscriptionSchema = mongoose.Schema({
    subscription_title : {
		type : String,
		required : true,
		trim : true,
		lowercase: true
    },
    subscription_limit  : {
		type : Number,
		required : true,
		trim : true
	},
	subscription_price  : {
		type : Number,
		required : true,
		trim : true
    }
});

module.exports = mongoose.model(_document_name, SubscriptionSchema);
