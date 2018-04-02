/**
 * Created by Tauqeer on 15-08-2016.
 */

var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var bodyParser = require('body-parser');

var UtilityFile = function Constructor() {

};


UtilityFile.prototype.getURL = function () {
    // Connection URL. This is where your mongodb server is running.
//var url = 'mongodb://localhost:27017/HRMS';

    var url ='mongodb://tauqeer:ideofuzion123@ds151028.mlab.com:51028/ethereumdb';
  return url;
};

UtilityFile.prototype.validateEmail = function (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

UtilityFile.prototype.checkIfElementExistsInArray = function (numberArray,number) {
    console.log(numberArray);
        console.log(numberArray[0].userContactNumber);
    for(var iNumberCount = 0;iNumberCount<numberArray.length;iNumberCount++)
    {
        if(numberArray[iNumberCount].userContactNumber==number)
        {
            return true;
        }
    }
    return false;
}



module.exports = UtilityFile;

