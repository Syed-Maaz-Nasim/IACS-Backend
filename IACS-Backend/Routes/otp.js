const express = require('express');
const router = express.Router();
const { commonDataValidation } = require('../middleware/dataValidation');
const { sendMail } = require('../middleware/Mail');
const { OTPjsonToken, decodeOTPToken } = require('../middleware/jsonToken');
const { generatePass, verifyOTP } = require('../middleware/cryptoGraphy');

router.post('/generate'
    , commonDataValidation
    , generatePass
    , OTPjsonToken
    , sendMail
);

router.post('/verify'
    , commonDataValidation
    , decodeOTPToken
    , verifyOTP
);



module.exports = router;