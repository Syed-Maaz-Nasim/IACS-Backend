const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');


const comparePassHash = async (req, res, next)=>{

    const {password, passwordHash} = req.body;
    await bcrypt.compare(password,passwordHash)
        .then(function(result){
            result ? next() :  res.status(401).end();
            
        })
        .catch(function(err){
            res.status(500).end();
            console.log('password hash comparing error');
        });

    // console.log( password, passwordHash);
    // console.log( typeof(password),typeof(passwordHash));
}


const generatePassHash = async (req, res, next)=>{
    
    const saltRound = req.body.config.bcrypt.saltRound;
    
    const {password} = req.body;
    await bcrypt.hash(password, saltRound)
        .then(function(hash){
            req.body.passwordHash = hash;
            next();
        })
        .catch(function(err){
            res.status(500).end();
            console.log('password hash comparing error');
        });
}



module.exports = {comparePassHash, generatePassHash};