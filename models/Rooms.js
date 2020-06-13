const mongoose = require('mongoose');

const _document_name = "Rooms";

let RoomsSchema = mongoose.Schema({
  hotel_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hotels' 
	},
	room_type : {
		type : String,
		required : true,
		trim : true
  },
  room_price  : {
      type : Number,
      required : true,
      trim : true
  },
  room_capacity: {
        adults: {
          type: Number,
          required: true
        },
        childs: {
          type: Number,
          default: 0
        }
    },
  room_count  : {
    type : Number,
    required : true,
    trim : true
  },
  room_amenities : {
    type : String,
    required : true,
    trim : true
  },
  room_gallery: {
      type: String,
      require: true
  },
  booking : [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking' 
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

function getRoom_price(num){
  return (num/100).toFixed(2);
}

function setRoom_price(num){
  return num*100;
}

RoomsSchema.pre('remove', function (next) {
  var room = this;
  room.model('Booking').update(
      { booking: room._id }, 
      { $pull: { room: room._id } }, 
      { multi: true }, 
      next);
});


module.exports = mongoose.model(_document_name, RoomsSchema);
