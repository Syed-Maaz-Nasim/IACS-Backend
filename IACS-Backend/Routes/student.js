const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authentication');
const { getStudent, stdSkill, stdExperience, searchByUniversity , searchByName, searchByYear, searchByDepart , searchBySkill} = require('../database/oracle');


router.post('/get'
, authenticate
, getStudent          
);

router.post('/skill/get'
, authenticate
, async (req,res, next) =>{
    req.body.refTokenData = { id: 81 }
    req.body.refTokenData.id = req.body.student.id ;
    next();
}
, stdSkill          
);

router.post('/experience/get'
, authenticate
, async (req,res, next) =>{
    req.body.refTokenData = { id : 81 }
    req.body.refTokenData.id = req.body.student.id ;
    next();
}
, stdExperience          
);

router.post('/searchBy/university'
, authenticate
,searchByUniversity
);

router.post('/searchBy/name'
, authenticate
,searchByName
);



router.post('/searchBy/year'
, authenticate
,searchByYear
);

router.post('/searchBy/depart'
, authenticate
,searchByDepart
);
router.post('/searchBy/skill'
, authenticate
,searchBySkill
);






module.exports = router;