var express = require('express');
var router = express.Router();

require('dotenv').config();
const {comparePassHash} = require('../middleware/hashing');
var {loginDataValidation} = require('../middleware/dataValidation');
var {genJsonToken} = require('../middleware/jsonToken');
var {DBvalidation , storeSession} = require('../database/oracle');
var {sessionCookie} = require('../middleware/Cookie');

/*
1. loginDataValidation is for checking the data i-e, data is correct or not
2. DBvalidation for fetching the user data in database
3. comparePassHash for comparing the password hashed from DB  with the user entered data
4. genJsonToken generate json token for user session management 
5. sessionCookie send cookie to the user browser
*/

router.post('/'
  , loginDataValidation
  , DBvalidation
  , comparePassHash
  , storeSession
  , genJsonToken
  , sessionCookie
);


module.exports = router;