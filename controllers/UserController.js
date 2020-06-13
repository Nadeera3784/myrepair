const {Hotels_Model} = require('../models');

const UserController = {

	async index(request, response, next){
		response.status(200);
		response.render("user/dashboard", {
			helper: request.helper
		});
	},

	async seeder(request, response, next){
		const Hotels = await Hotels_Model.find().populate("location");
		response.status(200).json({
			hotels: Hotels
		});
	}




	
  
};
  
module.exports = UserController;
  