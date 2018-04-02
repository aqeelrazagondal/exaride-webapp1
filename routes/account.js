const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const config = require('../config');
const checkJWT = require('../middlewares/check-jwt');
const Shift = require('../models/Shift');


router.post('/signup', (req, res, next) => {
 let user = new User();
  user.user_name = req.body.user_name;
 user.email = req.body.email;
 user.password = req.body.password;
 user.picture = user.gravatar();

 User.findOne({ email: req.body.email }, (err, existingUser) => {
  if (existingUser) {
    res.json({
      success: false,
      message: 'Account with that email is already exist'
    });
  } else {
      user.save();
      var token = jwt.sign({
        user: user
      }, config.secret, {
        expiresIn: '7d'
      });
    res.json({
      success: true,
      message: 'Enjoy your token',
      token: token,
      user: user
    });
  }
 });
});


router.post('/login', (req, res, next) => {

  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) throw err;

    if (!user) {
      res.json({
        success: false,
        message: 'Authenticated failed, User not found'
      });
    } else if (user) {

      var validPassword = user.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password'
        });
      } else {
        var token = jwt.sign({
          user: user
        }, config.secret, {
          expiresIn: '7d'
        });

        res.json({
          success: true,
          mesage: "Enjoy your token",
          token: token
        });
      }
    }

  });
});

router.post('/shift', (req, res, next) => {
  let shift = new Shift();
  // let user = new User();

  
  shift.shift_title = req.body.shift_title;
  shift.starting_time = req.body.starting_time;
  shift.ending_time = req.body.ending_time;
  shift.vehicle = req.body.vehicle;

  Shift.findOne({ }, (err, existingUser) => {
    if (existingUser) {
      res.json({
        success: false,
        message: 'Account with that email is already exist'
      });

    } else {
      shift.save();

      res.json({
        success: true,
        message: 'Enjoy your token'
      });
    }

  });
});


module.exports = router;
