exports.updateUserLocation = function (reqData, res) {
    try {
        var phoneNo = reqData.phoneNo;
        var longitude = reqData.longitude;
        var latitude = reqData.latitude;
        var userLoc = new Object({ latitude: latitude, longitude: longitude });

        //Check valid Location -180 to 180
        logger.info('LocationController.updateUserLocation called  :'
            + phoneNo + '**' + longitude + '**' + latitude);

        //Check if user have reached in radius of any marker set by admin
        var markersList = getMarkersList(function (markers) {
            if (markers) {
                logger.info('Marker Length : ' + markers.length);
                for (var i = 0; i < markers.length; i++) {
                    inRadiusNotification(phoneNo, userLoc, markers[i]);

                }
            }
            else {
                logger.info('An Error Occured While Finding Markers ');
            }
        });

        AppController.userExists(phoneNo, function (user) {
            if (user) {
                user.loc = [longitude, latitude];
                user.last_shared_loc_time = new Date();
                user.save(function (err, user) {
                    if (err) {
                        logger.error('Some Error while updating user' + err);

                    }
                    else {
                        logger.info('User Location With Phone Num ' + phoneNo);

                        res.jsonp({
                            status: "success",
                            message: "Location Updated!",
                            object: []
                        });
                    }


                });

                logger.info('location : ' + user.loc);
            }
            else {
                res.jsonp({
                    status: "failure",
                    message: "Failed To update Location!",
                    object: []
                });
            }

        });
    } catch (err) {
        logger.info('An Exception Has occured in updateUserLocation method' + err);
    }
}


function getMarkersList(callback) {


    try {
        Marker.find({}, function (err, markers) {
            if (err) {
                logger.info('An Error Occured While Finding Markers ' + err);
            }
            else {
                //logger.info(markers.length + ' Marker Found');
                callback(markers);
            }
        });
    } catch (err) {
        logger.info('An Exception Has occured in getMarkersList method' + err);
    }
}

function inRadiusNotification(phoneNo, userLoc, marker) {
    logger.info('marker.title : ' + marker.title);
    logger.info('marker.loc : ' + marker.loc);
    logger.info('userLoc  ' + '  latitude :' + userLoc.latitude + ' longitude : ' + userLoc.longitude);

    var query;
    var distance = geolib.getDistance(
        userLoc,
        marker.loc
    );
    logger.info('distance: ' + distance);

    //Check if distance is less then defined radius

    if (distance < marker.radius) {
        var markerObj = {

            title: marker.title,
            description: marker.description,
            marker_photo_url: marker.marker_photo_url,
            longitude: marker.loc[0],
            latitude: marker.loc[1],
            radius: marker.radius
        }
        //inside Radius, Send Push Notification
        logger.info('inside Radius, Send Push Notification');
        query = { phone: phoneNo };
        User.findOne(query).exec(function (err, user) {
            if (err) {
                logger.error('Some Error occured while finding user' + err);
            }
            if (user) {
                logger.info('User Found For Phone No: ' + phoneNo);
                logger.info('Sending Notification to player id ' + user.palyer_id);
                logger.info('marker Object : latitude = ' + markerObj.latitude + "** longitude =" + markerObj.longitude + "** radius =" + markerObj.radius);
                //logger.info('Individual Conversation msg  before Push Notification:'  );		
                NotificationController.sendNotifcationToPlayerId(user.palyer_id, markerObj, "reachedMarker");
                //msg=null;
            }
            else {
                logger.info('User not Found For Phone No: ' + phoneNo);
            }
        });

    }
}
 app.post('/location', function (req, res) {

    if (req.body === undefined || req.body === null) {
        res.end("Empty Body");
    }
    /*
      console.log("start"); 
      var country = new Country({ 
                _id:"4",
                country_id:4,
                name: "India", 
                code:"021",
                shortForm:"ind"
                 });
      country.save(function (err, country) {
           console.log("in save"); 
                if(err){
                   console.log(err); 
                }
          else
              console.log("Country Saved"+country); 
                
      });
*/
    console.log("in routes /location");
    var reqData = req.body;
    // console.log(reqData);
    LocController.updateUserLocation(reqData, res);
});