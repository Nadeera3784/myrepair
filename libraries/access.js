const debug = require('eyes').inspector({styles: {all: 'cyan'}});

const LanguageHelper = require('../helpers/language.js');
const {User_Model} = require('../models');


const is_authenticated = async (request, response, next) => {
	if (request.session.loggedIn) {
		next();
	} else {
        response.status(401);
        request.flash('danger', new LanguageHelper.LanguageHelpers().GetLine().__("User Not Logged In"));
        response.redirect(request.helper.base_url() + 'auth/login');
	}
};


function access_level_verifier(...allowed) {
    const isAllowed = role => allowed.indexOf(role) > -1;
  
    return function (request, response, next) {
        if (request.session.userRole  && isAllowed(request.session.userRole)){ 
            next();
        }else {
            response.status(401);
            request.flash('danger', new LanguageHelper.LanguageHelpers().GetLine().__("Permission Error"));
            response.redirect(request.helper.base_url() + 'auth/login');
        }
    };
}

module.exports = {
    is_authenticated,
    access_level_verifier,
};

