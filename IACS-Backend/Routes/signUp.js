var express = require('express');
var router = express.Router();

require('dotenv').config();
var   {signUpDataVaidation}     = require('../middleware/dataValidation');
const {generatePassHash}        = require('../middleware/hashing');
var   {addUser , storeSession}  = require('../database/oracle');
var   {genJsonToken}            = require('../middleware/jsonToken');
var   {sessionCookie}           = require('../middleware/Cookie');


/*

  1. loginDataValidation is for checking the data i-e, data is correct or not
  2. DBvalidation for fetching the user data in database
  3. comparePassHash for comparing the password hashed from DB  with the user entered data
  4. genJsonToken generate json token for user session management 
  5. sessionCookie send cookie to the user browser     

*/


router.post('/'
     , signUpDataVaidation
     , generatePassHash
     , addUser
     , storeSession
     , genJsonToken
     , sessionCookie
);


module.exports = router;