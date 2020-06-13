const mongoose = require('mongoose');

const _document_name = "Orders";

let OrdersSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    brand_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Brands'
    },
    order_reference : {
      type : String,
      required : true,
      trim : true
    },
    order_model: {
		type : String,
		required : true,
		trim : true
    },
    order_fault: {
		type : String,
		required : true,
		trim : true
    },
    order_customer_name: {
		   type : String,
		   required : true,
		   trim : true
    },
    order_customer_phone: {
		type : String,
		required : true,
		trim : true
    },
    order_customer_email: {
        type : String,
        lowercase: true,
        trim : true
    },
    order_customer_address: {
		type : String,
		trim : true
    },
    order_create_date: {
        type: Date,
        require: true
    },
    order_amount: {
      type: Number,
      default : 0
    },
    order_delete_request: {
      type: Boolean,
      default : false
    },
    order_status: {
        type: String,
        require: true,
        enum: ['processing', 'rejected', 'completed', 'repaired']
    }
});


function getOrder_amount(num){
  return (num/100).toFixed(2);
}

function setOrder_amount(num){
  return num*100;
}

module.exports = mongoose.model(_document_name, OrdersSchema);
