
//var AppController= require('../controller/AppController.js');
var Admin = require('../models/Admin.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
//require('datejs');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise;
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' });
//package for making HTTP Request
var request=require("request");


exports.login=function(username,password,callback){
    
    logger.info('Admin login Method Called');
     var query = { user_name : username };
     Admin.findOne(query).exec(function(err, admin){
        if (err){
            logger.error('Some Error while finding admin' + err );
            res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
            });
        }
        else{
            if (admin){
                
                logger.info('admin Found with username :'+username);                
               if (admin.password===password){
				   callback (admin);
			   }else{
				   logger.info('Wrong Password');        
				    callback (null);
			   }
               
            }
            else{
                
                logger.info('admin Not Found with username :'+username);
               
                callback( null);
                
            }
       }
     });
    
    logger.info(' Exit Admin Login Method');
	
}
                              

          /**********  Above Code is Working*****/
    

