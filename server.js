var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var http = require('http').Server(app);
 require('./routes/routes.js')(app);
var db = require('./config/db');
 require('datejs');
var io = require('socket.io')(http);
var HashMap = require('hashmap');
var User = require('./models/User.js');
var ChatController = require('./controller/ChatController.js');
var NotificationController = require('./controller/PushNotificationController.js');
var ConversationMessages = require('./models/ConversationMessages.js');
var Conversation = require('./models/Conversation.js');ConversationUser
var ConversationUser = require('./models/ConversationUser.js');
var logger = require('./config/lib/logger.js');
var mongoose = require('mongoose');
 require('./routes/accounts');
mongoose.Promise = global.Promise;

//mongoose.createConnection(db.url);
mongoose.connect(db.url);

// Heroku assigns a port if port = process.env.PORT  
var port = process.env.PORT || 3100;




// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.json());
//app.use(express.static(__dirname + '/public'));

http.listen(port, function(){
  console.log('listening on *:'+port);
});


var rooms = [];
var userMobileList = [];
var userHashMaps = new HashMap();

// Connection Event of SocketIO
io.sockets.on('connection', function(socket) {	    
    console.log ("Socket Connected with id :"+socket.id);
      
	// to add user mobile no. and socketID in hashmap
    socket.on('onConnect', function (phoneNo) {
		   try{
		   //removing spaces bw phone no if any
			 phoneNo = phoneNo.replace(/ +/g, "");
			 logger.info('onConnect Event  Called for Phone Num:' + phoneNo);
			 userHashMaps.set(phoneNo,socket.id);
			 socket.phoneNo=phoneNo;
			 logger.info("Users on socket " + userHashMaps.count());				  
			 logger.info(' Exit onConnect Event'); 
			} catch (err){
			logger.info('An Exception Has occured in onConnect event ' + err);
		}
		 
	}); //end of onConnect Event
                  
	//To verify If user is registerd on app or not
    socket.on('verifyUser', function (phoneNo, callback) {
		   try{
				//removing spaces bw phone no if any
				phoneNo = phoneNo.replace(/ +/g, "");
				logger.info('verifyUser Event  Called for Phone Num:' + phoneNo);
			   
				var query = { phone : phoneNo };
				User.findOne(query).exec(function(err, user){
					  if (err){
						  logger.error('Some Error occured while finding user' + err );
						  callback(false);
					  }
					  if (user){
						  logger.info('User Found For Phone No: ' + phoneNo );
						  userHashMaps.set(phoneNo,socket.id);
						  socket.phoneNo=phoneNo;                     
						  callback(true);
						  
					  }
					  else {
						  logger.info('User not Found For Phone No: ' + phoneNo );                 
						  callback(false);
					  }					  
				});
				logger.info(' Exit verifyUser Event'); 
		      } catch (err){
			logger.info('An Exception Has occured in verifyUser event' + err);
		}
	});  //end of verifyUser Event
    
    
    //Creating room event called when individual chat is initiated
	socket.on('createRoom', function ( userMobileNumberFrom, userMobileNumberTo,callback) {      
	  try{
		 //removing spaces bw phone no if any
		userMobileNumberFrom = userMobileNumberFrom.replace(/ +/g, "");
		userMobileNumberTo = userMobileNumberTo.replace(/ +/g, "");
		 
		logger.info('createRoom Event  Called for userMobileNumberFrom : '+userMobileNumberFrom + ' & userMobileNumberTo ' + userMobileNumberTo);
		
		var newconversation;
		var conversationId;
		//if (userMobileNumberFrom && userMobileNumberTo)
		if ((userMobileNumberFrom===userMobileNumberTo)||(!(userMobileNumberFrom && userMobileNumberTo))){
			logger.info ('Sender and Recipient are same or Either one is empty' );   
			 socket.emit('roomId',null);
		 }
		 else{
			// check if conversation between These Two users ever occured before, send conversationId / roomId in response         
			ChatController.chkPreviousIndividualConversation(userMobileNumberFrom,userMobileNumberTo,function(data){
			  
				logger.info ("chkPreviousIndividualConversation response :"+data);
			
				if (data){
					// Previous Conversation Found
					logger.info ('Previous Conversation Id Received :' + data );               
					conversationId=data;				
					socket.room = conversationId;
					socket.join(conversationId);
					//logger.info ('Sending room Id To client : ' + conversationId );
					logger.info ('Sending room Id ' + conversationId  + ' TO Client : '+ userMobileNumberFrom );				 
					socket.emit('roomId',conversationId);
					 
					 //send an invitation
					 var socketid= userHashMaps.get (userMobileNumberTo);
					 logger.info('sending a notification to socket: '+ socketid);
						var conversationObj ={
							fromPhoneNo:userMobileNumberFrom,	
							conversationId:conversationId, 
							isGroupConversation:false
					 }
					 if(userMobileNumberTo){
						 if (io.sockets.connected[socketid]) {						
							logger.info( socketid + ' is in connected Sockets List ');
							io.sockets.connected[socketid].emit('conversationRequest', conversationObj);
						 }							
							logger.info('Sending Onesignal Notifcation to '+ userMobileNumberTo );								  
							var query = { phone :userMobileNumberTo };
							User.findOne(query).exec(function(err, user){
							if (err){
							 logger.error('Some Error occured while finding user' + err );
							 }
							if (user){
							logger.info('User Found For Phone No: ' + userMobileNumberTo );
							logger.info('Sending Notification to player id ' + user.palyer_id );
							NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"conversationRequest");
							}
							else {
							 logger.info('User not Found For Phone No: ' + userMobileNumberTo );                 
							}                               
						});
					}
				}   
				else{
					//Creating New Conversation
						newconversation= new Conversation();
						newconversation.save(function (err, conversation) {
						if (err) logger.error('Error Occured while Saving new conversation :'+ err);
						if (conversation){
							 logger.info ('conversation created for id :'+conversation._id );
							conversationId=conversation._id;
							logger.info ('Creating Conversation Users against conversation id : '+conversation._id );
						var newConversationUser= new ConversationUser({                                          
							_conversationId: conversationId, 
							_userMobile: userMobileNumberFrom  
							});
						
						newConversationUser.save(function (err, conversationUser) {
							 if (err) logger.error('Error Occured while Saving new newConversationUser 1 :'+ err);
							});
				  
						 newConversationUser= new ConversationUser({                                          
							_conversationId: conversationId, 
							_userMobile: userMobileNumberTo   
								});
						
						newConversationUser.save(function (err, conversationUser) {
							 if (err) logger.error('Error Occured while Saving new newConversationUser 2:'+ err);
						});
						}
					
					
					 socket.room = conversationId;
					 socket.join(conversationId);
					 logger.info ('Sending TO Client : '+ userMobileNumberFrom );
					 logger.info (' Emiting room Id :' + conversationId );
					 socket.emit('roomId',conversationId);		
					});
						
				  
					} 
				logger.info(' Exit createRoom Event'); 
			});
	  }
      } catch (err){
			logger.info('An Exception Has occured in createRoom event' + err);
		}
      	  	  
	}); //end of createRoom Event
   
    
       //Swithing Room 
	socket.on('joinRoom', function (conversationId) {
		try{
		   logger.info('joinRoom Event  Called for room id :' + conversationId);
		//Joining New Room
		  rooms.push(conversationId);
		  socket.room = conversationId;
		  socket.join(conversationId);
		  socket.emit('roomId',conversationId);          
		  logger.info('JoinRoom Event Exit'); 
		}catch(err){
			  logger.info('An Exception Has occured in joinRoom event ' + err);		  
		}
	}); //end of joinRoom Event
    
	// leave Room
	socket.on('leaveRoom', function (conversationId) {
		try{
			logger.info('leaveRoom Event  Called for room id :' + conversationId);     
			//Leaving the socket's current room
			socket.room=null;
			socket.leave(socket.room);
			socket.emit('roomId',null);
			logger.info('LeaveRoom Event Exit'); 
		}catch(err) {
			  logger.info('An Exception Has occured in leaveRoom event' + err);		  
		}
	}); //end of leaveRoom Event
  
    socket.on('groupRequest', function (conversationId) {
		try {
			logger.info('groupRequest Event  Called for conversation id :' + conversationId);
			var socketid;
			var conversation;
			var createdDate;
			var myDate;
			ChatController.findConversation (conversationId , function(con){
					
					if (con){
						logger.info ('Conversation Found for Id  : '+ conversationId);
						conversation=con;
						
						ChatController.findConversationMembers(conversationId, function(members){
						if (members){
								logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
								myDate = new Date(members[0].createdAt);
								createdDate = myDate.getTime();
								
								var conversationObj ={
										//fromPhoneNo:userMobileNumberFrom,	
										conversationId:conversationId, 
										isGroupConversation:con.isGroupConversation,
										adminMobile:con.adminMobile,
										photoUrl:con.conversationImageUrl,
										conversationName:con.conversationName,
										createdAt:createdDate,
										
										}
									
										
										//Notifying All Group Members
								for (var i=0; i < members.length ; i++){
									var phoneNo=members[i]._userMobile;
									if (phoneNo!==(conversationObj.adminMobile)){
										logger.info('Getting Socket Id against Phone No :' +phoneNo)
										socketid= userHashMaps.get (phoneNo);
										
										//Emiting on socket
										logger.info('Emiting groupConversationRequest to socket: '+ socketid);									 
										if (io.sockets.connected[socketid]) {
											logger.info( socketid + ' is in connected Sockets List ');
												io.sockets.connected[socketid].emit('groupConversationRequest', conversationObj);																							
										} 
										
										//Sending Push Notiifcation To Group Members								
										logger.info('Sending Onesignal Notifcation of groupConversationRequest to '+  phoneNo  );
										//var phoneNo=members[i]._userMobile;
										var query = { phone : phoneNo };
										
										User.findOne(query).exec(function(err, user){
											if (err){
											 logger.error('Some Error occured while finding user' + err );
											 }
											if (user){
											logger.info('User Found For Phone No: ' + phoneNo );
											logger.info('Sending Notification to player id ' + user.palyer_id );
											NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupConversationRequest");
											}
											else {
											 logger.info('User not Found For Phone No: ' + phoneNo );                 
											}                               
										});
									}								
								}
						}
						});
					}
					if (con==null){
						logger.info ('Conversation For conversationId : '+ conversationId + 'is null');
						
					}
					
				});
				if (conversation!==null && conversation !== undefined ){
					logger.info ('Conversation Not Found');
					
				}				
		} catch (err){
			logger.info('An Exception Has occured in groupRequest event ' + err);
		}		
	
	});  //end of groupRequest Event
    
	
	
	socket.on('groupRequestToNewMembers', function (conversationId) {
		try {
			logger.info('groupRequest Event  Called for conversation id :' + conversationId);
			var socketid;
			var conversation;
			var createdDate;
			var myDate;
			ChatController.findConversation (conversationId , function(con){
					
					if (con){
						logger.info ('Conversation Found for Id  : '+ conversationId);
						conversation=con;
						
						ChatController.findConversationMembers(conversationId, function(members){
						if (members){
								logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
								myDate = new Date(members[0].createdAt);
								createdDate = myDate.getTime();
								
								var conversationObj ={
										//fromPhoneNo:userMobileNumberFrom,	
										conversationId:conversationId, 
										isGroupConversation:con.isGroupConversation,
										adminMobile:con.adminMobile,
										photoUrl:con.conversationImageUrl,
										conversationName:con.conversationName,
										createdAt:createdDate,
										
										}
										logger.info (' Conversation createdAt :' + conversationObj.createdAt);
										
										//Notifying All Group Members
								for (var i=0; i < members.length ; i++){
									var phoneNo=members[i]._userMobile;
									if (phoneNo!==(conversationObj.adminMobile)){
										logger.info('Getting Socket Id against Phone No :' +phoneNo)
										socketid= userHashMaps.get (phoneNo);
										
										//Emiting on socket
										logger.info('Emiting groupConversationRequest to socket: '+ socketid);									 
										if (io.sockets.connected[socketid]) {
											logger.info( socketid + ' is in connected Sockets List ');
												io.sockets.connected[socketid].emit('groupConversationRequest', conversationObj);																							
										} 
										
										//Sending Push Notiifcation To Group Members								
										logger.info('Sending Onesignal Notifcation of groupConversationRequest to '+  phoneNo  );
										//var phoneNo=members[i]._userMobile;
										var query = { phone : phoneNo };
										
										User.findOne(query).exec(function(err, user){
											if (err){
											 logger.error('Some Error occured while finding user' + err );
											 }
											if (user){
											logger.info('User Found For Phone No: ' + phoneNo );
											logger.info('Sending Notification to player id ' + user.palyer_id );
											NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupConversationRequest");
											}
											else {
											 logger.info('User not Found For Phone No: ' + phoneNo );                 
											}                               
										});
									}								
								}
						}
						});
					}
					if (con==null){
						logger.info ('Conversation with conversationId : '+ conversationId + 'is either deleted or not created yet');
						
					}
					
				});
				if (conversation!==null && conversation !== undefined ){
					logger.info ('Conversation Not Found');
					
				}				
		} catch (err){
			logger.info('An Exception Has occured in groupRequest event ' + err);
		}		
	
	});  //end of groupRequestToNewMembers Event
    
	
	
	
    socket.on('sendMessage', function (data) {
		try {
			logger.info('Data Object : '+data);
			data=JSON.parse(data);						
			var myDate;
			var createdDate;
			logger.info("listening sendMessage event on server : \n "+data.messageText +"**"+  data.messageType +"**"+ data._conversationId + "**"+data._messageFromMobile+"**"+data._messageToMobile);
			
			//check if room disconnected join again 
			var conversationId=data._conversationId;
			if (!(socket.room)){
			socket.room = conversationId;
			socket.join(conversationId);
			}
			var conversationMessage = new ConversationMessages();
			conversationMessage.messageType = data.messageType;
			conversationMessage.messageText = data.messageText;
			conversationMessage._conversationId = data._conversationId;
			conversationMessage._messageToMobile = data._messageToMobile;
			conversationMessage._messageFromMobile = data._messageFromMobile;
			conversationMessage.save(function (err, conMes) {
				if (conMes){
					myDate = new Date(conMes.createdAt);
					createdDate = myDate.getTime();
					logger.info('Conversation msg create at :' +createdDate );
					var msg ={
						messageType:data.messageType,
						messageText:data.messageText,
						_conversationId:data._conversationId,
						_messageToMobile:data._messageToMobile,
						_messageFromMobile:data._messageFromMobile,
						createdAt:createdDate,
						conversationName:null,
						conversationImageUrl:null,
						 //updatedAt:conversationMessage.updatedAt
					}
			
					var socketid;
					var sendNotifcationFlag;
					var recipientSocket;
					if (data._messageToMobile){
						// individual Chat
					logger.info('Individual Chat - SendMessage');
					socketid= userHashMaps.get (data._messageToMobile);						
					logger.info('sending a notification to socket: '+ socketid);
					sendNotifcationFlag=true;
					if (socketid){
						recipientSocket=io.sockets.connected[socketid];
						logger.info('Check room of Sender socket : ' + socket + 'where phone No is :'+socket.phoneNo + 'and room : ' +socket.room);		
						logger.info('Check room of Recipent socket :' + socketid + 'where phone No is :'+recipientSocket.phoneNo + 'and room : ' +recipientSocket.room);	
						if (recipientSocket){
							logger.info('Receipient Socket Found' );	
							if (recipientSocket.room===socket.room) {	
							logger.info('Rooms Matched' );
							//logger.info('Conversation msg create at before emiting:' +msg.createdAt );							
							recipientSocket.emit('receiveMessage', msg);	
							sendNotifcationFlag=false; 
							}
							else {
								logger.info('Rooms Not Matched recipientSocket.room : ' +recipientSocket.room + 'SenderSocket.room : ' +socket.room );
								
							}
						}
						else {
							logger.info('Receipient Socket Not Found , recipientSocket : ' + recipientSocket);	
						}
											
					}
					if (sendNotifcationFlag===true){			
						logger.info('Sending Onesignal Notifcation to '+ data._messageToMobile );									  
						var query = { phone :data._messageToMobile };
						User.findOne(query).exec(function(err, user){
							if (err){
								  logger.error('Some Error occured while finding user' + err );												
							}
							if (user){												  
								logger.info('User Found For Phone No: ' + data._messageToMobile );
								logger.info('Sending Notification to player id ' + user.palyer_id );
								logger.info('Msg Object : ' + msg);
								//logger.info('Individual Conversation msg  before Push Notification:'  );		
								NotificationController.sendNotifcationToPlayerId(user.palyer_id,msg,"receiveMessage");
								//msg=null;
							}
							else {
								logger.info('User not Found For Phone No: ' + data._messageToMobile );                 												  
							}                               
						});
						}
					}else{
					//group Chat
					logger.info('Group Chat - SendMessage');
					logger.info ("Emiting to Group room : "+socket.room);
					//logger.info('Group Conversation msg createAt before Emiting :' +msg.createdAt );	
					socket.to(socket.room).emit('receiveMessage', msg);
					var phoneNo;
					//Sending Message As push Notification to all members
					if (conversationId){
						ChatController.findConversation (conversationId , function(con){
						
						if (con){
						
							msg.conversationName=con.conversationName;
							msg.conversationImageUrl=con.conversationImageUrl;	
							
							ChatController.findConversationMembers(conversationId, function(members){
								logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
								//Notifying All Group Members
									for (var i=0; i < members.length ; i++){
										
										phoneNo=members[i]._userMobile;
										if (phoneNo!==(data._messageFromMobile)){  
											//Sending Push Notiifcation To Group Members								
											logger.info('Sending Onesignal Notifcation of receiveMessage to '+  phoneNo  );								  
											var query = { phone : phoneNo };
											User.findOne(query).exec(function(err, user){
												if (err){
													logger.error('Some Error occured while finding user' + err );
												 }
												if (user){
														
													logger.info('User Found For Phone No: ' + user.phone );
													logger.info('Group Conversation msg createAt before Push Notiifcation :' +msg.createdAt );	
													logger.info('Sending Notification of Group : '+msg.conversationName+ 'Phone No: ' +  user.phone +' & to player id  : ' + user.palyer_id );
													NotificationController.sendNotifcationToPlayerId(user.palyer_id,msg,"receiveMessage");
													//msg=null;
													//socketid= userHashMaps.get ( user.phone);
													//logger.info ('socketid : '+ socketid);
													
													//recipientSocket=io.sockets.connected[socketid];
													//logger.info ('recipientSocket : '+ recipientSocket);
													//if (recipientSocket){
														//if (recipientSocket.room===conversationId) {	
														//do not send notification
														//NotificationController.sendNotifcationToPlayerId(user.palyer_id,msg,"receiveMessage");
														//}
														//else {
															//NotificationController.sendNotifcationToPlayerId(user.palyer_id,msg,"receiveMessage");
														//}
													//}else{
															
													//}
												}
												else {
													logger.info('User not Found For Phone No: ' +  user.phone );                 
												}                               
											});	
									}									
									}
									
								}); //end of findConversationMembers call						
						}
						else {
							logger.info('Error Finding Group conversation for convesation id :'+ conversationId);
						}
						});
												
					}//// end if conversationID
			}// end of else data._messageToMobile 
		   		   		   		   
			}
				
			if (err){
				logger.error('Eror Saving Conversation message' +err);
			}
				
			});
			

	  }catch(err){
		  logger.info('An Exception Has occured in sendMessage event' + err);		  
	  }//end of catch
	}); //end of sendMessage Event
    
	socket.on('disconnect', function () {
		logger.info('Disconnect Event \n ' + socket.phoneNo + ' is disconnected' );
		userHashMaps.remove(socket.phoneNo);
		logger.info("Connected Users Count : " + userHashMaps.count());
	});//end of disconnect Event
    
}); //end of Connection Event