const mongoose = require('mongoose');

const _document_name = "Bill";

let BillSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    bill_reference : {
        type : String,
        required : true,
        trim : true
    },
    bill_payment_method: {
        type: String,
    },
    bill_transaction_id: {
        type: String,
    },
    bill_amount: {
      type: String,
      require: true
    },
    bill_status: {
        type: String,
        require: true,
        enum: ['pending', 'processing', 'paid', 'due']
    },
    bill_update_date: {
        type: Date
    },
    bill_create_date: {
        type: Date,
        require: true,
        default: Date.now
    }
});

module.exports = mongoose.model(_document_name, BillSchema);
