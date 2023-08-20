
const express = require('express');
const { jobPost, jobRequest } = require('../database/oracle');
const authenticate = require('../middleware/authentication');
const { jobValidation, jobPostValidation } = require('../middleware/dataValidation');
const { getJob, jobSkill, searchBycompanyName, searchBytittle, searchByAddress, searchBylocation, searchByJobSkill} = require('../database/oracle');

const router = express.Router();


router.post('/get'
, authenticate
, getJob          
);

router.post('/skill/get'
, authenticate
, async (req,res, next) =>{
    req.body.refTokenData = { id: 81 }
    req.body.refTokenData.id = req.body.job.id ;
    next();
}
, jobSkill          
);

router.post('/searchBy/companyName'
, authenticate
,searchBycompanyName
);

router.post('/searchBy/tittle'
, authenticate
,searchBytittle
);

router.post('/searchBy/address'
, authenticate
,searchByAddress
);

router.post('/searchBy/location'
, authenticate
,searchBylocation
);


router.post('/searchBy/skill'
, authenticate
,searchByJobSkill
);



router.post('/request'
, authenticate
, jobValidation
, jobRequest          
);

router.post('/post'
, authenticate
, jobPostValidation
, jobPost          
);


module.exports = router;

