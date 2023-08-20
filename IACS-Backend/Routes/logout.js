var express = require('express');
var router = express.Router();
let {decodejsonToken} = require('../middleware/jsonToken');
let { deleteUserSession, deleteAllUserSession } = require('../database/oracle');
var {clearUserCookie} = require('../middleware/Cookie');

router.get('/'

, clearUserCookie 
, decodejsonToken
, deleteUserSession

);

router.get('/all'
, clearUserCookie 
, decodejsonToken
, deleteAllUserSession
);



module.exports = router;