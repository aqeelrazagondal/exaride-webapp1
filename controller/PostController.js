const _ = require('lodash');
//var AppController= require('../controller/AppController.js');
var User = require('../models/User.js');
var Owner = require('../models/Owner.js');
var Post = require('../models/Post.js');
var OwnerPost = require('../models/OwnerPost.js');
var PostRating = require('../models/PostRating.js');
var TopStory = require('../models/TopStory.js');
var Quote = require('../models/Quote.js');
var GalleryImage = require('../models/GalleryImage.js');
var Mentor = require('../models/Mentor.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
//require('datejs');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise;
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' });
//package for making HTTP Request
var request=require("request");
var http = require("http");
// We need this to build our post string
var querystring = require('querystring');
//package to generate a random number
var randomize = require('randomatic');
var ObjectId = require('mongoose').Types.ObjectId;

var pageSize=10;

exports.findAllPosts=function(_id,callback){
 
    try{
		if (ObjectId.isValid(_id)){

			logger.info("Valid Object Id");
	
			Post.find({'_id': {'$gt': _id}}, function(err, posts) {
				if (err){ 
					 res.status(400).send({status:"Failure",
											  message:err,
											  object:[]
											});
				}
				
				else{ 
					logger.info(posts.length + ' posts Found');
					callback(posts);
				} 
				}).sort( [['_id', -1]] ).limit(pageSize);
		}else {
			logger.info("In Valid Object Id");
			Post.find({}, function(err, posts) {
				if (err){
					 res.status(400).send({status:"Failure",
											  message:err,
											  object:[]
											});
				}
				else{ 
					logger.info(posts.length + ' posts Found');
					callback(posts);
					//process.exit();
				} 
				}).sort( [['_id', -1]] ).limit(pageSize);
		}
     
		}catch (err){
		logger.info('An Exception Has occured in findAllPosts method' + err);
	}
}


exports.findTopStories=function(id,res,callback){
    
    try{
	
			TopStory.find({},{ _postId: 1, _id:0 },function(err,stories){
				if (err){
					res.status(400).send({status:"Failure",
											message:err,
											object:[]
										});
				}
						
				else{ 
					
					logger.info(stories.length + ' stories Found');
					logger.info(stories.length + stories);
					var postids=[];
					stories.forEach(story => {
						postids.push(story._postId);
					});
					
					if (ObjectId.isValid(id)){

						Post.find({$and: [ { _id:postids }, { _id: {'$gt': id}}  ]}, function(err, posts) {
							if (err){
								logger.info("Error Occured While Finding Top Story Posts"+err );
								res.status(400).send({status:"Failure",
														message:err,
														object:[]
								});
							}					
							else{ 
								logger.info(posts.length + 'Top Story posts Found');
								callback(posts);		
							} 
						}).limit(pageSize);
					}
					else{
						Post.find({ _id:postids}, function(err, posts) {
							if (err){
								logger.info("Error Occured While Finding Top Story Posts"+err );
								res.status(400).send({status:"Failure",
														message:err,
														object:[]
								});
							}					
							else{ 
								logger.info(posts.length + 'Top Story posts Found');
								callback(posts);		
							} 
						}).sort( [['_id', -1]] ).limit(pageSize);
					}
				
				} 

			});
   
		}catch (err){
		logger.info('An Exception Has occured in findAllPosts method' + err);
	}
}

exports.myPosts=function(postId,userId,callback){
 
    try{
		//userId="5aa80c922d3fdd0014a06694";
		if (ObjectId.isValid(postId)){

			logger.info("Valid Object Id");
			Post.find({$and: [ { _postedByUserId:userId }, { _id: {'$gt': id}}  ]}, function(err, posts) {
			//Post.find({'_id': {'$gt': postId}}, function(err, posts) {
				if (err){ 
					 res.status(400).send({status:"Failure",
											  message:err,
											  object:[]
											});
				}
				
				else{ 
					logger.info(posts.length + ' posts Found');
					callback(posts);
				} 
				}).sort( [['_id', -1]] ).limit(pageSize);
		}else {
			logger.info("In Valid Object Id");
			Post.find({ _postedByUserId:userId }, function(err, posts) {
				if (err){
					 res.status(400).send({status:"Failure",
											  message:err,
											  object:[]
											});
				}
				else{ 
					logger.info(posts.length + ' posts Found');
					callback(posts);
					//process.exit();
				} 
				}).sort( [['_id', -1]] ).limit(pageSize);
		}
     
		}catch (err){
		logger.info('An Exception Has occured in findAllPosts method' + err);
	}
}

exports.ownersIdeas=function(postId,callback){
 
    try{
		
		OwnerPost.find({},{ _postId: 1, _id:0 },function(err,posts){
		if (err){
			res.status(400).send({status:"Failure",
									message:err,
									object:[]
								});
		}
				
		else{ 
			
			logger.info(posts.length + ' posts Found');
			//logger.info(posts.length + posts);
			var postids=[];
			posts.forEach(post => {
				postids.push(post._postId);
			});
			
			if (ObjectId.isValid(postId)){
				logger.info("Valid Object Id");
				Post.find({$and: [ { _id:postids }, { _id: {'$gt': postId}}  ]}, function(err, posts) {
				
				if (err){ 
					 res.status(400).send({status:"Failure",
											  message:err,
											  object:[]
											});
				}
				
				else{ 
					logger.info(posts.length + ' posts Found');
					callback(posts);
				} 
				}).sort( [['_id', -1]] ).limit(pageSize);
		}else {
			logger.info("In Valid Object Id");
			Post.find({ _id:postids}, function(err, posts) {
				if (err){
					logger.info("Error Occured While Finding Owners Posts"+err );
					res.status(400).send({status:"Failure",
											message:err,
											object:[]
					});
				}					
				else{ 
					logger.info(posts.length + 'Owners posts Found');
					callback(posts);		
				} 
			}).sort( [['_id', -1]] ).limit(pageSize);
			
			}
		}
	});
     
	}catch (err){
		logger.info('An Exception Has occured in findAllPosts method' + err);
	}
}

exports.addToTopStories = function (reqData,res){
   
	var postId=reqData.postId;
	logger.info("postId: "+postId);

    var topStory=new TopStory({  
		_postId:postId 	
    });

    topStory.save(function (err, story){
        if(err){
            logger.error('Some Error while Adding Post To Top Stories' + err ); 
          
            res.jsonp({status:"Failure",
            message:"Error while Adding Post To Top Stories",
            object:[]});
        }
        else{
            logger.info('Adding Post To New Top Stories' );
            res.jsonp({status:"Success",
							message:"Post Added To Top Stories",
							object:story});
        
        }
      });
}


//Update TopStory

exports.updateTopStory=function(reqData,res){
	try{
			var storyId=reqData._id;
			//bool
			var show=reqData.show;
		
			logger.info('PostController.updateTopStory called for id :' + storyId );						  
			var query = { _id : storyId };
			// find TopStory by Id	 
			TopStory.findOne(query).exec(function(err, story){
				if (err){
					logger.error('Some Error while finding story' + err );
					res.status(400).send({status:"Failure",
										message:err,
										object:[]
					});
				}
				else{
					if (story){
						if (show===true){
							story.show=true;
						}
						if (show===false){
							story.show=false;
						}
						
						story.save(function (err, story){
							if(err){
								logger.error('Some Error while updating story' + err );
								res.jsonp({status:"Failure",
								message:"Error Occured while Updating story ",
									object:[]}); 	
							}
							else{
								logger.info('story updated  '  );												
								res.jsonp({status:"Success",
								message:"Stroy Updated!",
									object:story}); 
							}								 							  
						  });
					}
					else {
						logger.error('No  Such story found to update ' + err );
						res.status(400).send({status:"Failure",
											message:'No  Such story found to update ' +err,
											object:[]
										});
					}
				}
			});
	}catch (err){
		logger.info('An Exception Has occured in updateStory method' + err);
	}
}

//Rate Post

exports.ratePost = function (req,res){
   
	var reqData=req.body;
	var ratedByUserId=req.user._id;
	var postId=reqData.postId;
	var ratedValue=reqData.ratedValue;
	
	logger.info("ratedByUserId: "+ratedByUserId );

	// Chk if Same User Have Rated Same Video Before
	var query = {$and: [ { _ratedByUserId : ratedByUserId }, { _postId:postId}]};
	
	PostRating.findOne(query).exec(function(err, rating){
		if(err){
            logger.error('Some Error while Rating Post : ' + err ); 
            res.jsonp({status:"Failure",
            message:"Error while Rating a Post.",
			object:[]});
		}else{
				if (rating){
					logger.info('Editing Previous Rating Found with iD :'+ rating._id  );
					
					rating._postId=postId;
					rating._ratedByUserId=ratedByUserId;
					rating.ratedValue=ratedValue;

							rating.save(function (err, rate) {
								if (rate){
									res.jsonp({status:"Success",
									message:"Updated Previous Rating!",
									object:rate});
								}
							
								else{
									logger.info('Error in Updated Previous Rating! :'  );
									res.jsonp({status:"Failure",
											message:"Failed updating Updated Previous Rating!",
											object:[]});
								}
							});	
				}else {
					logger.info('Adding New ratings :'  );
					var newPostRating=new PostRating({  
						_postId: postId,
						_ratedByUserId:ratedByUserId ,
						ratedValue:ratedValue                   
					
					});
				
					newPostRating.save(function (err, postRating){
						if(err){
							logger.error('Some Error while Rating Post : ' + err ); 
						
							res.jsonp({status:"Failure",
							message:"Error while Rating a Post.",
							object:[]});
						}
						else{
							logger.info('New Quote Added' );
							res.jsonp({status:"Success",
											message:"Post Successfully Rated.",
											object:postRating});
						
						}
					});
					

			}
		}

	});
	
}

exports.addQuote = function (reqData,res){
   
	
	var userId=reqData.user._id;
	var text=reqData.text;
	var author=reqData.author;
	logger.info("userId: "+userId + " - Author - "+ author);

	var newQuote=new Quote({  
	_postedByUserId: userId,
	quoteText:text,
	author:author                      
	
	});

	  newQuote.save(function (err, quote){
        if(err){
            logger.error('Some Error while Adding New Quote : ' + err ); 
          
            res.jsonp({status:"Failure",
            message:"Error while Adding New Quote",
            object:[]});
        }
        else{
            logger.info('New Quote Added' );
            res.jsonp({status:"Success",
							message:"New Quote Added",
							object:quote});
        
        }
      });
}

//Update Quote

exports.updateQuote=function(reqData,res){
	try{
			var quoteId=reqData._id;
			var text=reqData.text;
			var author=reqData.author;
		
			logger.info('PostController.updateQuote called for id :' + quoteId );						  
			var query = { _id : quoteId };
			// find Quote by Id	 
			Quote.findOne(query).exec(function(err, quote){
				if (err){
					logger.error('Some Error while finding Quote' + err );
					res.status(400).send({status:"Failure",
										message:err,
										object:[]
					});
				}
				else{
					if (quote){
						if (text){
							quote.text=text;
						}
						
						if (author){
							quote.author=author;
						}
						
						quote.save(function (err, quote){
							if(err){
								logger.error('Some Error while updating quote' + err );
								res.jsonp({status:"Failure",
								message:"Error Occured while Updating quote ",
									object:[]}); 	
							}
							else{
								logger.info('Quote updated  '  );												
								res.jsonp({status:"Success",
								message:"Quote Updated!",
									object:quote}); 
							}								 							  
						  });
					}
					else {
						logger.error('No  Such quote found to update ' + err );
						res.status(400).send({status:"Failure",
											message:'No  Such quote found to update ' +err,
											object:[]
										});
					}
				}
			});
	}catch (err){
		logger.info('An Exception Has occured in updateQuote method' + err);
	}
}

//Delete Quote

exports.deleteQuote=function(quoteId,res){
    try {
		
		logger.info('deleteQuote Method Called for id : '+quoteId);		
		Quote.remove({ _id: quoteId}, function (err) {
				if (err){
					logger.error('Error Occured while Removing  Quote :'+ err);
					res.jsonp({status:"Failure",
                            message:"Error Occured while removing Quote",
                            object:[]}); 
				}
				else{
					logger.info('Quote with id ' +quoteId + ' successfully Removed' );
					res.jsonp({status:"Success",
								message:"Quote successfully Removed!",
								object:[]}); 
				}
				// removed!
		});				                                                
	}catch  (err){
		logger.info ('An Exception occured PostController.deleteQuote ' + err);
	}	
	
}

exports.findAllQuotes=function(callback){
     
    try{
        
        Quote.find({}, function(err, quotes) {
			if (err){
				 res.status(400).send({status:"Failure",
										  message:err,
										  object:[]
										});
			}
			
			else{ 
				logger.info(quotes.length + ' quotes Found');
				callback(quotes);
				//process.exit();
			} 
			}).sort( [['_id', -1]] );
		}catch (err){
		logger.info('An Exception Has occured in findAllQuotes method' + err);
	}
}

exports.uploadPost = function (req,_attachmentUrl,_thumbnailUrl,_postType,res){
	logger.info("User Received After Authetication: "+req.user._id);
	logger.info("User Type: "+req.user.user_type);
	var desc=req.body.description;
	var title=req.body.title;

    var newPost=new Post({  
    _postedByUserId:req.user._id,
    postType:_postType,
	postDescription:desc,
	title:title,
	attachmentUrl: _attachmentUrl,
	thumbnailUrl:  _thumbnailUrl                    
    });

    newPost.save(function (err, post){
        if(err){
            logger.error('Some Error while Creating New Post' + err ); 
          
            res.jsonp({status:"Failure",
            message:"Error in Creating New Post",
            object:[]});
        }
        else{
			if (req.user.user_type==="owner"){
				logger.info("Owner is Uploading video with Id: "+req.user._id );
				var newOwnerPost=new OwnerPost({  	
					_postId:post._id,
					_userId: req.user._id                     
				});
				newOwnerPost.save(function (err, ownerPost){
					if(err)
						logger.error('Some Error while Creating New Owner Post' + err );

					  
				});
			}
            logger.info('New Post Created' );
            res.jsonp({status:"Success",
							message:"File Successfully Uploaded",
							object:post});
            //callback(user);
        }
      });
}


exports.uploadImageForGallery = function (req,imageUrl,res){
	logger.info("User Received After Authetication: "+req.user._id);
	//logger.info("User Type: "+req.user.user_type);
	var imageTitle=req.body.imageTitle;
	logger.info('imageUrl : '+ imageUrl ); 
	if(imageUrl.indexOf("https:") > -1) {
	
		var newPost=new GalleryImage({  
			imageTitle:imageTitle, 
			imageUrl:imageUrl,
			                
			});
			newPost.save(function (err, post){
				if(err){
					logger.error('Some Error while Uploading New Image' + err ); 
				  
					res.jsonp({status:"Failure",
					message:"Error in Uploading New Image",
					object:[]});
				}
				else{
				
					logger.info('Image Uploaded with id : '+ post._id );
					res.jsonp({status:"Success",
									message:"Image Successfully Uploaded",
									object:post});
					
				}
			});
	}else{

		logger.error('imageUrl.indexOf("http://postvideo") : '+ imageUrl.indexOf("http://postvideo") ); 	  
		res.jsonp({status:"Failure",
		message:"Error in Uploading New Image",
		object:[]});
		
	}


}


exports.getImageGallery=function(postId,callback){
 
    try{
		// var newPost=new GalleryImage({  
		// 	imageTitle:"WTC In hall ", 
		// 	imageUrl:"http://www.alhussainproperties.com/wp-content/uploads/2018/01/Giga-Mall-Shopping-Home-Page-Slider-Banner-3-1-1.jpg",
			                
		// 	});
		// 	newPost.save(function (err, post){});
		GalleryImage.find({},function(err,images){
		if (err){
			res.status(400).send({status:"Failure",
									message:err,
									object:[]
								});
		}else {
			callback(images);
		}
		
	}).sort( [['_id', -1]] );
     
	}catch (err){
		logger.info('An Exception Has occured in findAllPosts method' + err);
	}
}
