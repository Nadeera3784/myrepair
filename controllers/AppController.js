const AppController = {

  async index(request, response, next){
    response.render('home', {
        title: 'Homa Page', 
        helper: request.helper
    });
    response.status(200);
  },
  async seeds(request, response, next){
    const mongoose = require('mongoose');
    const {User_Model, Subscription_Model} = require('../models');
    const subscription = await Subscription_Model.find({subscription_title : "free"});
    let User = new User_Model({ 
      first_name : "super",
      last_name : "admin",
      email : "admin@admin.com",
      phone : "078747834",
      password : "password",
      role : 'admin',
      subscription_id : mongoose.Types.ObjectId(subscription._id)
    });
    await User.save();

    response.render('home', {
        title: 'Homa Page', 
        helper: request.helper
    });
    response.status(200);
  }
  

};

module.exports = AppController;
