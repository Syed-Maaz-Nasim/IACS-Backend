var express = require('express');
var router = express.Router();
var {genAdminJsonToken} = require('../middleware/jsonToken');
var {AdminSessionCookie} = require('../middleware/Cookie');
var {AdminclearUserCookie} = require('../middleware/Cookie');
const authenticate = require('../middleware/authentication');

/*
1. loginDataValidation is for checking the data i-e, data is correct or not
2. DBvalidation for fetching the user data in database
3. comparePassHash for comparing the password hashed from DB  with the user entered data
4. genJsonToken generate json token for user session management 
5. sessionCookie send cookie to the user browser
*/

router.post('/', 
    async (req, res, next) => {

        const { clientName , config} = req.body;    // admin
        const isValidName = clientName == "admin";


        if (!isValidName) {
            res.status(400).end();
        }
        else {
                try {
                    const { email, password } = req.body;
                    const isOK = email== config.admin.email && password == config.admin.password;
                    isOK ? next() : res.status(401).end("Wrong Password");
                }
                catch {
                    res.status(400).end();
                }
        }
    }
  , genAdminJsonToken
  , AdminSessionCookie
);



router.post('/logout' 
    , authenticate
    , AdminclearUserCookie
);




module.exports = router;