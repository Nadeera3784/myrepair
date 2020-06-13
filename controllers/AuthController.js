const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const debug = require('eyes').inspector({styles: {all: 'cyan'}});

const LanguageHelper = require('../helpers/language.js');
const {User_Model} = require('../models');
const config_api = require('../config/api.js');

const AuthController = {

    async login(request, response, next){
        if(request.session.loggedIn){
            response.redirect(request.helper.base_url() + request.session.userRole +'/dashboard/');
        }else{
            response.status(200);
            response.render("login", {
                helper: request.helper
            });
        }
    },

    async logout(request, response, next){
        response.status(200);
        request.session.loggedIn = null;
        request.session.userId = null;
        request.session.userRole = null;
        request.session.destroy();
        response.redirect(request.helper.base_url() + 'auth/login');
    },

    async login_action(request, response, next){
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            response.status(401);
            response.render("login", {
                password_error :  errors.mapped().password,
                email_error :  errors.mapped().email,
                helper: request.helper
            });
        }else{
            await User_Model.findOne({ email: request.body.email, isActive : "1"}).exec(function (err, user) {
                if (!user) {
                    response.status(401);
                    request.flash('danger', new LanguageHelper.LanguageHelpers().GetLine().__("Login Error"));
                    response.render("login", {
                        helper: request.helper
                    });
                }else{
                    bcrypt.compare(request.body.password, user.password, function (err, result) {
                        if (result === true) {
                            const accessToken = jwt.sign({ userId: user._id }, config_api.api.jwt_secret, {
                                expiresIn: "1d"
                            });
                            //User_Model.findByIdAndUpdate(user._id, { accessToken }, { new: true }, function (err, tk) { });
                            response.status(200);
                            //response.append('x-access-token', accessToken);
                            request.session.loggedIn = true;
                            request.session.userId = user._id;
                            request.session.userRole = user.role;
                            request.flash('info', 'Hi there, Welcome back!!!');
                            response.redirect(request.helper.base_url() + user.role + '/dashboard/');
                        }
                        else {
                            if (request.body.remember) {
                                request.session.cookie.maxAge = 1000 * 60 * 3;
                            }
                            else {
                                request.session.cookie.expires = false;
                            }
                            response.status(401);
                            request.flash('danger', new LanguageHelper.LanguageHelpers().GetLine().__("Login Error"));
                            response.render("login", {
                                helper: request.helper
                            });
                        }
                    })
                }
            });
        }
    }


    
  
  };
  
  module.exports = AuthController;
  