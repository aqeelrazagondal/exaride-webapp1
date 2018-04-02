const router = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('../models/User');
const config = require('../config/db');
const checkJWT = require('../middleware/check-jwt');

module.exports = function (app) {	
    //Enable All CORS Requests
    app.use(cors());
    app.use(function (req, res, next) {
        //res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*");
        next();
    });
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    // parse application/json
    app.use(bodyParser.json())

    app.post('/signup', (req, res, next) => {
        let user = new User();
        user.name = req.body.name;
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
                    token: token
                });
            }

        });
    });

}

// router.post('/login', (req, res, next) => {

//     User.findOne({ email: req.body.email }, (err, user) => {
//         if (err) throw err;
//         if (!user) {
//             res.json({
//                 success: false,
//                 message: 'Authenticated failed, User not found'
//             });
//         } else if (user) {
//             var validPassword = user.comparePassword(req.body.password);
//             if (!validPassword) {
//                 res.json({
//                     success: false,
//                     message: 'Authentication failed. Wrong password'
//                 });
//             } else {
//                 var token = jwt.sign({
//                     user: user
//                 }, config.secret, {
//                         expiresIn: '7d'
//                     });

//                 res.json({
//                     success: true,
//                     mesage: "Enjoy your token",
//                     token: token
//                 });
//             }
//         }
//     });
// });

module.exports = router;