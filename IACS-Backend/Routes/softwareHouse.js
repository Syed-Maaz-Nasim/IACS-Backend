const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authentication');
const { getSoftwareHouse, indServices, searchByIndusCompanyName , searchByIndusAddress, searchByIndusService} = require('../database/oracle');


router.post('/get'
, authenticate
, getSoftwareHouse          
);

router.post('/service/get'
, authenticate
, async (req,res, next) =>{
    req.body.refTokenData = { id: 81 }
    req.body.refTokenData.id = req.body.industries.id ;
    next();
}
, indServices          
);


router.post('/searchBy/companyName'
, authenticate
,searchByIndusCompanyName
);


router.post('/searchBy/address'
, authenticate
,searchByIndusAddress
);


router.post('/searchBy/service'
, authenticate
,searchByIndusService
);






module.exports = router;