const mongoose = require('mongoose');

const _document_name = "Locations";

let LocationsSchema = mongoose.Schema({
    locaton_name : {
		type : String,
		required : true,
		trim : true
	},
    latitude  : {
		type : String,
		required : true,
		trim : true
    },
	longitude  : {
		type : String,
		required : true,
		trim : true
	}
});

module.exports = mongoose.model(_document_name, LocationsSchema);


