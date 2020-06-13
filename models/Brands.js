const mongoose = require('mongoose');

const _document_name = "Brands";

let BrandsSchema = mongoose.Schema({
    brand_name : {
		type : String,
		required : true,
		trim : true,
		lowercase: true
	}
});

module.exports = mongoose.model(_document_name, BrandsSchema);