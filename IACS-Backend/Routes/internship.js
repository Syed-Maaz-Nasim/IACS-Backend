
const express = require('express');
const { jobRequest , internsPost } = require('../database/oracle');
const authenticate = require('../middleware/authentication');
const { jobValidation, jobPostValidation } = require('../middleware/dataValidation');
const { getIntern, InternSkill, searchByInterncompanyName
     , searchByInterntittle , searchByInternAddress , searchByInternlocation
      , searchByInternSkill, } = require('../database/oracle');
const router = express.Router();


router.post('/get'
, authenticate
, getIntern          
);

router.post('/skill/get'
, authenticate
, async (req,res, next) =>{
    req.body.refTokenData = { id: 81 }
    req.body.refTokenData.id = req.body.job.id ;
    next();
}
, InternSkill          
);

router.post('/searchBy/companyName'
, authenticate
,searchByInterncompanyName
);

router.post('/searchBy/tittle'
, authenticate
,searchByInterntittle
);

router.post('/searchBy/address'
, authenticate
,searchByInternAddress
);

router.post('/searchBy/location'
, authenticate
,searchByInternlocation
);


router.post('/searchBy/skill'
, authenticate
,searchByInternSkill
);




router.post('/request'
, authenticate
, jobValidation
, jobRequest          
);


router.post('/post'
, authenticate
, jobPostValidation
, internsPost          
);





module.exports = router;

