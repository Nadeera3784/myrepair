const AppController = {

  async index(request, response, next){
    response.render('home', {
        title: 'Homa Page', 
        helper: request.helper
    });
    response.status(200);
  },
  async seeds(request, response, next){
    const {User_Model} = require('../models');

    let User = new User_Model({ 
      first_name : "super",
      last_name : "admin",
      email : "admin@admin.com",
      phone : "078747834",
      password : "password",
      role : 'admin'
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
