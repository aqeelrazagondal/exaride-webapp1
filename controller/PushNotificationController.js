
//var AppController= require('../controller/AppController.js');
var User = require('../models/User.js');
var db = require('../config/db');
var oneSignalConfig = require('../config/OneSignalConfig');
var logger = require('../config/lib/logger.js');
//require('datejs');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//User = mongoose.model('User')
mongoose.createConnection(db.url);


var https = require('https');
 var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic OWU2NTgxNDUtOTViNi00N2VmLWIyOWEtZGM0YzZhOGZlZWQ0",
	"EventName":null
  };
   var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };


exports.sendNotifcationToPlayerId = function (playerId,obj,eventName){
	try{
		
	//setHeader ("EventName",eventName);
	headers.EventName=eventName;
	console.log ('playerId : '+playerId);
	var data = { 
	  app_id:oneSignalConfig.androidAppiId,
	  contents: {"en": "Aldaalah"},
	  headings:{"en":eventName},
	  include_player_ids: [playerId],
	  data:obj,
	  priority:10,
  
	//will need to change for ios
	android_group:eventName,
	
	// for IOS
	content_available:true,
	mutable_content:true
	};
	
  var req = https.request(options, function(res) {  
    res.on('data', function(data) {
      console.log("Response before parsing : " + data);
	  
      console.log("Response after parsing : " + JSON.parse(data));
    });
  });
  
  req.on('error', function(e) {
    console.log("ERROR:");
    console.log(e);
  });
  
  req.write(JSON.stringify(data));
  req.end();

}catch (err){
		logger.info('An Exception Has occured in sendNotifcationToPlayerId method' + err);
	}
}


// require the module 
//const OneSignalClient = require('node-onesignal');
 
// create a new clinet 
//const client = new OneSignalClient(oneSignalConfig.androidAppiId, oneSignalConfig.androidAuthKey);
//const client = new OneSignalClient("111", "111");
//client.sendNotification('test notification', {
  //  included_segments: 'all'
//});


/*
exports.sendNotifcationToPlayerId=function(){
 var oneSignal = require('onesignal')("OWU2NTgxNDUtOTViNi00N2VmLWIyOWEtZGM0YzZhOGZlZWQ0","8c415ffd-a41d-41cb-9f32-01111cc9dbac",true);
// send a notification 

var data= new Object({"field1":"value1" , "field2":"value2" });
console.log('sending Notification');
oneSignal.createNotification("message", data, "03bd1410-c6f1-4e14-9e12-02e6fd718691	",function (data){
	console.log ('Response Received');
	if (err)
		console.log ('Error in Sdin Noti'+err);
	if (data)
		console.log ('Suucess Sent');
	
}); 
}

*/



/*
var onesignal = require('node-opensignal-api');
var onesignal_client = onesignal.createClient();
 
var userAuthKey = 'MWJhMmJhNjEtOTQyMi00N2YzLWIwMjYtNzMxNjE4OTc4OWE5';
onesignal_client.apps.viewall(userAuthKey, function (err, response) {
    if (err) {
    	console.log('Encountered error', err);
  	} else {
    	console.log(response);
  	}
});
var appAuthKey ="OWU2NTgxNDUtOTViNi00N2VmLWIyOWEtZGM0YzZhOGZlZWQ0"
var params = {
    app_id: oneSignalConfig.androidAppiId	
};
onesignal_client.players.viewall(appAuthKey, params, function (err, response) {
    if (err) {
    	console.log('Encountered error', err);
  	} else {
    	console.log(response);
  	}
});
*/