
const express = require('express');
const { MessageStore, getMessage } = require('../database/oracle');
const authenticate = require('../middleware/authentication');
const { messageValidation } = require('../middleware/dataValidation');
const router = express.Router();

router.post('/get'
, authenticate
, getMessage          
);

router.post('/post'
, authenticate
, messageValidation
, MessageStore          
);


module.exports = router;