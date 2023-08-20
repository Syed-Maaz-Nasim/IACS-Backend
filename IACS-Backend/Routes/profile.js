
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authentication');
const { getPicture, updatePicture, basicInfo, updateBasicInfo, skillOption, stdSkill, updateSkill,
        removeExperience, modifyExperience, stdExperience, addExperience , serviceOption
         , indServices , updateServices , orgInfo , updateOrgInfo} = require('../database/oracle');
const { basicInfoValidation } = require('./../middleware/dataValidation');


router.get('/info'
 , authenticate
 , basicInfo          
);


router.post('/info'
    , authenticate
    , basicInfoValidation
    , updateBasicInfo
);


router.get('/skillOption'
    , skillOption
);


router.get('/stdSkills'
    , authenticate
    , stdSkill
);

router.post('/stdSkills'
    , authenticate
    , updateSkill
);

router.get('/stdExperience'
    , authenticate
    , stdExperience
);

router.post('/stdExperience'
    , authenticate
    , addExperience
);


router.post('/modify/stdExperience'
    , authenticate
    , modifyExperience
);

router.post('/remove/stdExperience'
    , authenticate
    , removeExperience
);

router.get('/pic'

 , authenticate
 , getPicture
);


router.post('/pic'
 , authenticate
 , updatePicture
);


//industry
router.get('/serviceOption'
    , serviceOption
);



router.get('/indServices'
    , authenticate
    , indServices
);
 
router.post('/indServices'
, authenticate
, updateServices
);



router.get('/industry/info'
 , authenticate
 , orgInfo          
);



router.post('/industry/info'
, authenticate
, basicInfoValidation
, updateOrgInfo          
);





module.exports = router;