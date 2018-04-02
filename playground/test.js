exports.register = function (reqData, res) {

    try {
        // var body = _.pick(req.body, ['email', 'password']);
        // var user = new User(body);    
        logger.info('RegistrationController.register called  :' + reqData.email);

        var email = reqData.email;
        var password = reqData.password;
        var userType = reqData.userType;
        var accessCode = reqData.accessCode;
        var os = reqData.os;
        var newuser;
        var newSubUser;
        var newOwner;
        var newMentor;
        var userResponseObject;

        if (userType !== undefined && password !== undefined && email !== undefined) {
            userType = userType.toLowerCase();
            userExists(email, function (userExist) {
                logger.info('User Exists Response : ' + userExist);
                if (userExist === null) {
                    logger.info("Creation New User");

                    if (userType === "owner") {
                        //Owner Register
                        if (accessCode === "wtc123") {
                            newuser = new User({
                                email: email,
                                password: password,
                                user_type: userType,
                                access_code: accessCode,
                                OS: os,
                                verified_user: false
                            });

                        } else {
                            res.jsonp({
                                status: "Failure",
                                message: "Please Enter Correct Access Code",
                                object: []
                            });
                        }
                    }
                    else {
                        //Mentor Register
                        newuser = new User({
                            email: email,
                            password: password,
                            user_type: userType,
                            // access_code:accessCode,
                            OS: os,
                            verified_user: false
                        });

                    }

                    newuser.save().then((user) => {

                        console.log("User : " + user);
                        userResponseObject = {
                            "_id": user._id,
                            "email": user.email,
                            "userType": user.user_type,

                        };
                        if (userType === "owner") {

                            newOwner = new Owner({
                                _userId: user._id
                            });
                            newOwner.save(function (err, owner) {
                                if (err) {
                                    logger.info('Error While Creating New Owner ');
                                }
                            });

                        }
                        if (userType === "owner") {

                            newOwner = new Owner({
                                _userId: user._id
                            });
                            newOwner.save(function (err, owner) {
                                if (err) {
                                    logger.info('Error While Creating New Owner ');
                                }
                            });

                        }
                        else if (userType === "mentor") {
                            newMentor = new Mentor({
                                _userId: user._id
                            });
                            newMentor.save(function (err, mentor) {
                                if (err) {
                                    logger.info('Error While Creating New Mentor ');
                                }
                            });
                        }
                        return user.generateAuthToken();
                    })
                        .then((token) => {
                            // res.header('x-auth', token).send(newuser);
                            //newuser.user_type="test";

                            res.setHeader('x-auth', token);
                            res.jsonp({
                                status: "Success",
                                message: "Successfully Registered",
                                object: userResponseObject
                            });
                        })
                        .catch((e) => {
                            //res.status(400).send(e);
                            logger.info('Error in saving User: ', e);
                            res.jsonp({
                                status: "Failure",
                                message: "Some Error Occured While Registering New User",
                                object: []
                            });
                        })

                }
                else {
                    res.jsonp({
                        status: "Failure",
                        message: "User with this Email Already Exists",
                        object: []
                    });
                }
            });
        }
        else {
            res.jsonp({
                status: "Failure",
                message: "Please Enter All Required Fields for Registration",
                object: []
            });
        }



        logger.info(' End RegistrationController.register Method');
    } catch (err) {
        logger.info('An Exception Has occured in RegistrationController.register method' + err);
    }
}


app.post('/register', function (req, res) {

    if (req.body === undefined || req.body === null) {
        res.end("Empty Body");
    }

    logger.verbose('register-POST called ');
    var reqData = req.body;
    logger.info("in routes /register - Req Data : " + reqData);
    regCtrl.register(reqData, res);

});