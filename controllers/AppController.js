const AppController = {

  async index(request, response, next){
    response.render('home', {
        title: 'Homa Page', 
        helper: request.helper
    });
    response.status(200);
  }
  

};

module.exports = AppController;
