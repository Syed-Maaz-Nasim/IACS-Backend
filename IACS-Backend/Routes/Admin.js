
const express = require('express');
const authenticate = require('../middleware/authentication');
const { AdminHome } = require('../database/oracle');
const router = express.Router();


router.get('/home'
, authenticate
, AdminHome          
);


module.exports = router;

