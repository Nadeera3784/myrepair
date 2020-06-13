const mongoose = require('mongoose');

const _document_name = "Hotels";

let HotelsSchema = mongoose.Schema({
    hotel_title : {
		type : String,
		required : true,
		trim : true
	},
	hotel_slug : {
		type : String,
		required : true,
		trim : true
    },
    hotel_description  : {
		type : String,
		required : true,
		trim : true
	},
	hotel_owner : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
	},
	hotel_amenities : {
		type : String,
		required : true,
		trim : true
	},
	hotel_gallery: { 
		type : String,
		trim : true 
    },
    hotel_location: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Locations' 
	},
	isActive: {
		type: String,
		enum: ['0', '1'],
		default: '1',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	}
});

HotelsSchema.static('findHotelByTitle', function(title) {
	return new Promise((resolve, reject) => {
		mongoose.model(_document_name, HotelsSchema).findOne({hotel_title : title}).exec(function (err, hotel){
		    if (err) reject(err)
		    resolve(hotel);
		});
    });
});

module.exports = mongoose.model(_document_name, HotelsSchema);
