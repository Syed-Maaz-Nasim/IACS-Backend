const otpGenerator = require("otp-generator");
const crypto       = require("crypto");

const { scrypt, randomFill, createCipheriv, createDecipheriv } = require('crypto');
const algorithm = 'aes-192-cbc';

const generatePass = async (req, res, next) => {
    
    const key = req.body.config.otp.encKey;
    const { email, password } = req.body;

    // Generate a 6 digit numeric OTP
    const OTP      = otpGenerator.generate(6, {alphabets: false, upperCase: false, specialChars: false});
    const ttl      = 30 * 60; //5 Minutes in seconds
    const iat      = Math.floor(Date.now()/1000); //timestamp to 5 minutes in the future
    const exp      = iat + ttl; //timestamp to 5 minutes in the future
    const data     = JSON.stringify({email, OTP, exp, password }); 
    const hash     = crypto.createHmac("sha256",key).update(data).digest("hex"); // creating SHA256 hash of the data
    
    // you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS
    const tokenData = {hash , iat, exp}
    req.body = { OTP , tokenData , ...req.body }
    next();
}



const verifyOTP = async (req, res, next) => {

    const key = req.body.config.otp.encKey;
    const { email, hash, exp, password, OTP } = req.body;

    const data        = JSON.stringify({email, OTP, exp, password }); 
    const newHash     = crypto.createHmac("sha256",key).update(data).digest("hex"); // creating SHA256 hash of the data   

    if(newHash == hash )
        res.status(200).send("verified");
    else
        res.status(400).send();

}


module.exports ={verifyOTP , generatePass};
