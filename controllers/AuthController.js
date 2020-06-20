const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const async = require('async');
const crypto = require('crypto');

const debug = require('eyes').inspector({styles: {all: 'cyan'}});

const LanguageHelper = require('../helpers/language.js');
const {User_Model} = require('../models');
const config_api = require('../config/api.js');
const {sendmail}  = require('../libraries/mailer');

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
    },
    async forgot(request, response, next){
        response.status(200);
        response.render("forgot", {
            helper: request.helper
        });
    },
    async forgot_action(request, response, next){

        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                  var token = buf.toString('hex');
                  done(err, token);
                });
            },
            function(token, done) {
                const errors = validationResult(request);
		        if (!errors.isEmpty()) {
                    response.status(200);
                    response.render("forgot", {
                        helper: request.helper,
                        email_error  :   errors.mapped().email,
                    });
                }else{
                    User_Model.findOne({ email: request.body.email }, function(err, user) {
                        if (!user) {
                           response.status(200);
                           request.flash('danger', 'No account with that email address exists');
                           response.redirect(request.helper.base_url() +'auth/forgot');
                        }else{
                            user.resetPasswordToken = token;
                            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                            user.save(function(err) {
                              done(err, token, user);
                            });
                        }
                    });
                }
            },
            function(token, user, done) {
                
                var html = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                 'http://' + request.headers.host + '/auth/reset/' + token + '\n\n' +
                 'If you did not request this, please ignore this email and your password will remain unchanged.\n'

                sendmail(request, response, "nadeera@codemelabs.com", user.email, "Password Reset", html).then(function(error){
                    if(error){
                        response.status(200);
                        request.flash('danger', 'Something went wrong, please try again later');
                        response.redirect(request.helper.base_url() +'auth/forgot');
                    }else{
                        response.status(200);
                        request.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                        response.redirect(request.helper.base_url() +'auth/login');
                    }
                });

            }
        ], function(err) {
            if (err) return next(err);
            response.status(200);
            request.flash('danger', 'Something went wrong, please try again later');
            response.redirect(request.helper.base_url() +'auth/forgot');
        });
    },
    async reset(request, response, next){
        User_Model.findOne({ resetPasswordToken: request.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              response.status(200);
              request.flash('danger', 'Password reset token is invalid or has expired');
              response.redirect(request.helper.base_url() +'auth/forgot');
            }
            response.render('reset', {
              helper: request.helper,
              token : request.params.token
            });
        });
    },
    async reset_action(request, response, next){
        async.waterfall([
            function(done) {
                User_Model.findOne({ resetPasswordToken: request.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                  if (!user) {
                    request.flash('danger', 'Password reset token is invalid or has expired');
                    return response.redirect('back');
                  }
          
                  user.password = request.body.password;
                  user.resetPasswordToken = undefined;
                  user.resetPasswordExpires = undefined;
          
                  user.save(function(err) {
                    // req.logIn(user, function(err) {
                    //   done(err, user);
                    // });
                    done(err, user);
                  });
                });
              },
            function(user, done) {
                var html = 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'

                sendmail(request, response, "nadeera@codemelabs.com", user.email, "Your password has been changed", html).then(function(error){
                    if(error){
                        response.status(200);
                        request.flash('danger', 'Something went wrong, please try again later');
                        response.redirect(request.helper.base_url() +'auth/forgot');
                    }else{
                        request.flash('success', 'Success! Your password has been changed.');
                        done(user);
                    }
                });
                
            }
            ], function(err) {
                response.status(200);
                request.flash('info', 'Success! Your password has been changed.');
                response.redirect(request.helper.base_url() +'auth/login');
            });
    }
  
  };
  
  module.exports = AuthController;
  