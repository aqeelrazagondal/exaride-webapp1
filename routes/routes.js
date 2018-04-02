var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();

var Location = require('../models/location');
var Passenger = require('../models/passenger');
var Shift = require('../models/shift');
var User = require('../models/user');

router.post('/register', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({ status: 'failure', message: 'Please pass username and password.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password
    });

    // save the user
    newUser.save().then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Created User Succesfully',
        user: {
          username: result.username,
          password: result.password,
          request: {
            type: 'POST',
            url: 'http://localhost:3100/api/register/'
          }
        }
      });
    })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
    }
});

router.post('/login', function(req, res) {
  var userResponseObject;
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({ success: false, message: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user, config.secret);

          userResponseObject = new User ({
            username: req.body.username,
            password: req.body.password
          });
          // return the information including token as JSON
          res.json({ 
            status: "success",
            message: "Successfully Logged In",
            object: userResponseObject 
          });
        } else {
          res.status(401).send({ 
            status: "failure",
            message: 'Authentication failed. Wrong password.'
          });
        }
      });
    }
  });
});

router.post('/addLocation', (req, res, next) => {
  const location = new Location({
    name: req.body.name,
    latitude: req.body.latitude,
    longitude: req.body.longitude
  })
  location.save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        status: 'Added Location Succesfully',
        locationDetail: {
          name: result.name,
          latitude: result.latitude,
          longitude: result.longitude,
          request: {
            type: 'POST',
            url: 'https://damp-sierra-13906.herokuapp.com/api/addLocation'
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get('/getAllLocations', (req, res, next) => {
  Location.find()
    .select('name latitude longitude')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        shift: docs.map(doc => {
          return {
            name: doc.name,
            latitude: doc.latitude,
            longitude: doc.longitude,
            request: {
              type: 'GET',
              url: 'https://damp-sierra-13906.herokuapp.com/api/getAllLocationsw'
            }
          }
        })
      }
      console.log(docs);
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/addShift', (req, res, next) => {
  const shift = new Shift({
    _userId: new mongoose.Types.ObjectId(),
    shift_title: req.body.shift_title,
    vehicle: req.body.vehicle
  })
  shift.save().then(result => {
    console.log(result);
    res.status(201).json({
      status: 'Created shift Succesfully',
      shiftDetail: {
        _userId: result._userId,
        shift_title: result.shift_title,
        vehicle: result.vehicle,
        request: {
          type: 'POST',
          url: 'https://damp-sierra-13906.herokuapp.com/api/' + result._userId
        }
      }
    });
  })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/addPassenger', (req, res) => {
  if (!req.body.full_name || !req.body.email) {
    res.json({ status: 'failure', message: 'Please enter full name and password.' });
  } else {
    var passenger = new Passenger({
      phone: req.body.phone,
      full_name: req.body.full_name,
      email: req.body.email,
      address: req.body.address
      // profile_photo_url: req.body.profile_photo_url
      // city: req.body.address.city
    });

    // save the user
    passenger.save(function (err) {
      if (err) {
        return res.json({
          status: "failure",
          message: 'Paassenger already exists.'
        });
      }
      res.json({
        status: 'success',
        message: 'Successful created new user.',
        object: passenger
      });
    });
  }
});


router.post('/addShift', (req, res, next) => {
  const shift = new Shift({
    _userId: new mongoose.Types.ObjectId(),
    shift_title: req.body.shift_title,
    vehicle: req.body.vehicle
  })
  shift.save().then(result => {
    console.log(result);
    res.status(201).json({
      status: 'Created shift Succesfully',
      shiftDetail: {
        _userId: result._userId,
        shift_title: result.shift_title,
        vehicle: result.vehicle,
        request: {
          type: 'POST',
          url: 'https://damp-sierra-13906.herokuapp.com/api/' + result._userId
        }
      }
    });
  })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get('/getAllShift', (req, res, next) => {
  Shift.find()
    .select('_userId shift_title vehicle')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        shift: docs.map(doc => {
          return {
            vehicle: doc.vehicle,
            shift_title: doc.shift_title,
            _userId: doc._userId,
            request: {
              type: 'GET',
              url: 'https://damp-sierra-13906.herokuapp.com/api/getAllShift/' + doc._userId
            }
          }
        })
      }
      console.log(docs);
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});



module.exports = router;
