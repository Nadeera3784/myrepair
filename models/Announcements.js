const mongoose = require('mongoose');

const _document_name = "Announcements";

let AnnouncementsSchema = mongoose.Schema({
    announcement_title : {
		type : String,
		required : true,
        trim : true,
        lowercase: true
	},
    announcement_type  : {
		type : String,
		required : true,
        trim : true,
        lowercase: true
    },
    announcement_users  : {
		type : String,
    },
	announcement_description  : {
		type : String,
		required : true,
		trim : true
    },
    announcement_date: {
		type: Date,
		default: Date.now,
	}
});

module.exports = mongoose.model(_document_name, AnnouncementsSchema);