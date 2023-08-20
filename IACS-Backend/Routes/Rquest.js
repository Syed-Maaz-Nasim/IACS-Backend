const express = require('express');
const { getStudentRequest } = require('../database/oracle');
const authenticate = require('../middleware/authentication');
const router = express.Router();


router.post('/get'
, authenticate
, getStudentRequest          
);





module.exports = router;

