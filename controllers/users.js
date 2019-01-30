var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var requiresLogin = require('../middleware/middleware');
var users = require('../models/modelusers');
var bcrypt = require('bcryptjs');

module.exports = function(app){
    // get request on index page.
    app.get('',function(req, res){
        res.render('index');
    });

    app.post('/signup', urlencodedParser, function(req, res){
        //Authenticating the user
        if ((req.body.email &&
            req.body.name &&
            req.body.password &&
            req.body.passwordConf &&
            req.body.mob &&
            req.body.empid) &&
            (req.body.password === req.body.passwordConf)) {
            req.body.passwordConf = true;
            users(req.body).save(function (err) {
              if (err) {
                throw err;
              } else {
                res.redirect('/login');
              }
            });
          } else {
            res.render('index',{msg:'Please fill all details carefully.'});
          }
    });

    //login Page
    app.get('/login', function(req, res){
        res.render('login');
    });

    app.post('/authenticate', urlencodedParser, function(req, res){
        users.authenticate(req.body.email.toLowerCase(), req.body.password, function(err, user){
            if (err){
                res.render('login',{msg:"Wrong username or password"});
            }else{
              if (!user) {
                res.render('login',{msg:"Wrong username or password"});
              }else {
                req.session.userId = user._id; 
                res.redirect('/profile');
              }
              
            }
            
        });
    });

    app.get('/profile', urlencodedParser, requiresLogin, function(req, res){
        users.findOne({_id: req.session.userId}, function(err, user){
          if (err){
            throw err;
          }
          res.render('profile',{data: user});
        });
    });


    app.get('/logout', requiresLogin, function(req, res, next) {
        if (req.session) {
          // delete session object
          req.session.destroy(function(err) {
            if(err) {
              return next(err);
            } else {
              return res.redirect('/');
            }
          });
        }
      });

    app.get('/editprofile',requiresLogin, function(req, res){
      users.findOne({_id: req.session.userId}, function(err, user){
        if (err){
          throw err;
        }
        res.render('editprofile',{data: user});
      });
    });

    app.post('/editprofile', urlencodedParser, requiresLogin, function(req, res){
      users.findOne({_id: req.session.userId}, function(err, user){
        if (err) {
          throw err;
        }
        users.authenticate(user.email, req.body.password, function(err, user){
          if (err) {
            users.findOne({_id: req.session.userId}, function(err, user){
              res.render('editprofile',{data:user, msg:"please enter correct password"});
            });
          } else{
            if (!user) {
              users.findOne({_id: req.session.userId}, function(err, user){
                res.render('editprofile',{data:user, msg:"please enter correct password"})
              });
            }else {
              users.updateOne({_id: req.session.userId},{email: req.body.email, mob: req.body.mob}, function(err, user){
                if (err) {
                  throw err;
                }
                res.redirect('/editprofile');
              });
            }
          }         
          
        })
      });
    });


    app.get('/changepassword',requiresLogin, function(req, res){
      users.findOne({_id: req.session.userId}, function(err, user){
        if (err){
          throw err;
        }
        res.render('changepassword',{data: user});
      });
    });

    app.post('/changepassword', urlencodedParser, requiresLogin, function(req, res){
      if ((req.body.password &&
        req.body.passwordConf &&
        req.body.newpassword) &&
        (req.body.newpassword === req.body.passwordConf)){
          bcrypt.hash(req.body.newpassword, 10, function (err, hash){
            if (err) {
              return next(err);
            }
            req.body.newpassword = hash;
          });
          users.findOne({_id: req.session.userId}, function(err, user){
            users.authenticate(user.email, req.body.password, function(err, user){
              if (err) {
                users.findOne({_id: req.session.userId}, function(err, user){
                  res.render('changepassword',{data:user, msg:"please enter correct password"});
                });
              } else{
                if (!user) {
                  users.findOne({_id: req.session.userId}, function(err, user){
                    res.render('changepassword',{data:user, msg:"please enter correct password"})
                  });
                }else {
                  users.updateOne({_id: req.session.userId},{password: req.body.newpassword}, function(err, user){
                    if (err) {
                      throw err;
                    }
                    res.redirect('/logout');
                  });
                }
              }
            })
          });
        }else {
              users.findOne({_id: req.session.userId}, function(err, user){
                res.render('changepassword',{data:user, msg:"please enter correct password"})
              });
            }
        
    });
};
