const validator = require('validator');
const axios = require('axios');



const  loginDataValidation  = async (req,res,next)=>{

    const { clientName } = req.body;    // student or industry
    const   isValidName  = clientName == "student" || "industry";
    
    try{
    req.body.email = validator.normalizeEmail(req.body.email ,{all_lowercase: true });
    }
    catch{
        res.status(400).end();
    }

    if(!isValidName){
        res.status(400).end();
    }
    else{
        if( clientName =='student' ){ // for student data checking
            try{
                const { email, password } = req.body;  
                const isOK  = validator.isEmail(email) && !validator.isEmpty(password);
                isOK ? next(): res.status(401).end();  
            }
            catch{
                res.status(400).end();
            }
        
        }else{ // for industry data checking
            try{
                const { email, password } = req.body;
                const isOK  = validator.isEmail(email) && !validator.isEmpty(password);
                isOK ? next(): res.status(401).end("input validation error");  
            }
            catch{
                res.status(400).end();
            }
        }
    }   
}


const  commonDataValidation = async (req,res,next)=>{
    
    const { clientName } = req.body; // student or industry
    const isValidName    = clientName == "student" || "industry";
    
    if(!isValidName){
        res.status(400).end();
    }
    else{
        try{
            
            //normalization of input data
            try{
            req.body.email  = validator.normalizeEmail(req.body.email ,{all_lowercase: true });
            }
            catch{
                res.status(400).end();
            }
            const { email, password } = req.body;
             
            
            let isEmail;
            if( clientName =='student' ){ // for student data checking
                // validating Email
                isEmail = validator.isEmail(email) && validator.contains(email, '@cloud.neduet.edu.pk', {ignoreCase: false});
            }
            else {
                //validating email
                isEmail = validator.isEmail(email);
            }

            //checking password is strong 
            const isPassword = validator.isStrongPassword(
                password
                , { minLength: 8, minLowercase: 0, minUppercase: 0, minNumbers: 1, minSymbols: 1, returnScore: false }
            );


            if (isEmail && isPassword) {
                // res.status(200).send("Mail Send");
                next();
            }
            else {
                res.status(400).end("Invalid Input Data");
            }
        }
        catch {
            res.status(400).end("Invalid Input Data");
        }
    }


}


const  signUpDataVaidation  = async (req,res,next) => {

    const { clientName } = req.body; // student or industry
    const isValidName = clientName == "student" || "industry";
    
    if(!isValidName){
        res.status(400).end("invalid clientName");
    }
    else{
        if( clientName =='student' ){ // for student data checking
            try{

                //normalization of input data
                try{
                req.body.email      = validator.normalizeEmail(req.body.email ,{all_lowercase: true });
                req.body.enrollment = req.body.enrollment.toUpperCase();
                req.body.fname      = req.body.fname.charAt(0).toUpperCase() + req.body.fname.slice(1);
                req.body.lname      = req.body.lname.charAt(0).toUpperCase() + req.body.lname.slice(1);
                req.body.university = req.body.university.toUpperCase();
                }
                catch{
                    res.status(400).end();
                }

                const { fname, lname, email, phoneNumber, enrollment, university, year, semester, department, CGPA , password } = req.body;  
                const {OTP, token} = req.body;

                //validating OTP
                const isOTP = validator.isLength(OTP , {min:6, max: 6});
                
                //validating token
                const istoken = validator.isJWT(token);

                let isVerify = true;
                const reqData = {email, password, clientName, OTP, token};
                await axios.post("http://localhost:8393/api/otp/verify",{ ...reqData },{
                    headers: {  'Content-Type': 'application/json' }
                })
                .then((res)=>{
                    if(res.status==200)
                        isVerify= true;
                })
                
                //validating name
                const isName = validator.isAlpha(fname ,['en-US'], {ignore: '/[\s|\-|_]/g'} ) && validator.isLength(fname , {min:2, max: 10})
                                 && validator.isLength(lname , {min:2, max: 10}) && validator.isAlpha(lname,['en-US'], {ignore: '/[\s|\-|_]/g'});

                // validating Email
                const isEmail = validator.isEmail(email) && validator.contains(email, '@cloud.neduet.edu.pk', {ignoreCase: false}) ;
                
                //validating phone number
                const isPhone = validator.isMobilePhone( phoneNumber , ['en-PK'], {strictMode:true} );
                
                //validaing Enrollment 
                const isEnrollment  = validator.contains( enrollment,'/',{ ignoreCase: false, minOccurrences: 2 }) 
                    && validator.contains(enrollment,'NED/',{ ignoreCase: true, minOccurrences: 1 })
                    && validator.isLength(enrollment,{min:13, max: undefined});

                //validating university name
                
                const isUniversity = ((validator.isAlpha(university,['en-US'], {ignore: '/[\s|\-|_]/g'}) || 
                validator.isAlphanumeric(university,['en-US'], {ignore: '/[\s|\-|_]/g'})) );

                //valdating year and semester
                const isYearSem =  validator.isNumeric(year,{no_symbols: true}) && validator.isNumeric( semester ,{no_symbols: true})
                                    && validator.isFloat( year , {min:'1.0', max:'5.0'}) && validator.isFloat( semester , {min:'1.0', max:'2.0'});

                //validating department name
                const isDepartment = validator.isAlpha(department);

                //validating CGPA
                const isCGPA = validator.isFloat( CGPA , {min:'1.0', max:'4.0'})
             
                //checking password is strong 
                const isPassword = validator.isStrongPassword( 
                      password  
                    ,{ minLength: 8, minLowercase: 0, minUppercase: 0, minNumbers: 1, minSymbols: 1, returnScore: false }
                );

                ( isOTP && istoken && isVerify && isEmail && isPhone && isEnrollment && isUniversity && isYearSem && isDepartment && isCGPA && isName && isPassword) ? next():
                 res.status(400).end("Input Validation Fail");  
            }
            catch{
                res.status(400).end("Input Validation Bad Request");
            }
        }
        else if( clientName =='industry' ){ // for industry data checking
            try{

                req.body.email          = validator.normalizeEmail(req.body.email ,{all_lowercase: true });
                req.body.companyName    = req.body.companyName.charAt(0).toUpperCase() + req.body.companyName.slice(1);
                req.body.hrName         = req.body.hrName.charAt(0).toUpperCase() + req.body.hrName.slice(1);

                const {email, companyName, hrName,  phoneNumber,  cnic, city, country, password} = req.body;                  
                const {OTP, token} = req.body;

                //validating OTP
                const isOTP = validator.isLength(OTP , {min:6, max: 6});
                
                //validating OTP
                const istoken = validator.isJWT(token);

                let isVerify = true;
                const reqData = {email, password, clientName, OTP, token};
                await axios.post("http://localhost:8393/api/otp/verify",{ ...reqData },{
                    headers: {  'Content-Type': 'application/json' }
                })
                .then((res)=>{
                    if(res.status==200)
                        isVerify= true;
                })
                
                //validating email
                const I_isEmail = validator.isEmail(email);

                //validating Organization Name
                const I_isName = !(validator.isEmpty(companyName));

                //validating hr name
                const I_isHrName = validator.isAlpha(hrName,['en-US'], {ignore: '/[\s|\-|_]/g'});
                
                //validating phone number 
                const I_isPhone = validator.isMobilePhone( phoneNumber , ['en-PK'], {strictMode:true} );

                //validating cnic number
                const I_isCnic = validator.isNumeric(cnic,{no_symbols: true}) 
                && ( validator.isLength(cnic,{min:13, max: 13}) || validator.isLength(cnic,{min:7, max: 7}));

                //validating city 
                const I_isCity = validator.isAlpha(city,['en-US'], {ignore: '/[\s|\-|_]/g'}); 

                //validating country
                const I_isCountry = validator.isAlpha(country,['en-US'], {ignore: '/[\s|\-|_]/g'});

                //strongness of password 
                const I_isPassword = validator.isStrongPassword( 
                    password  ,{ minLength: 8, minLowercase: 0, minUppercase: 0, minNumbers: 1, minSymbols: 1, returnScore: false }
                );

                (isOTP && istoken && isVerify && I_isEmail && I_isName && I_isHrName && I_isPhone && I_isCnic && I_isCity && I_isCountry && I_isPassword ) ? next()
                : res.status(400).end("Input Validation Fail"); 

            }
            catch{
                res.status(400).end("Input Validation Bad Request");
            }
        }
    }
}



const basicInfoValidation = async (req, res, next) => {

    // const clientName = "student"
    const { clientName } = req.body.refTokenData;
    const { basicInfo } = req.body;
    const { phoneNumber, enrollment, department, year, semester, CGPA, DOB, gender, address, linkedin, github, aboutUs } = basicInfo;
     const { hrName, website } = basicInfo;



    try {
        // let Error = null;
        if (clientName == 'student') { // for student data checking

            if (validator.isMobilePhone(phoneNumber, ['en-PK'], { strictMode: true }) === false) {
                throw { code: 400, info: "Invalid Mobile Number, Please follow tips", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            if ((validator.contains(enrollment, '/', { ignoreCase: false, minOccurrences: 2 })
                && validator.contains(enrollment, 'NED/', { ignoreCase: true, minOccurrences: 1 })
                && validator.isLength(enrollment, { min: 13, max: undefined })) === false) {
                throw { code: 400, info: "Invalid Enrollnment No:", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            if (validator.isEmpty(department)) {
                throw { code: 400, info: "Please select Department", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            if (validator.isEmpty(year)) {
                throw { code: 400, info: "Please select Year , invalid selection of Year", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            if (validator.isEmpty(semester)) {
                throw { code: 400, info: "Please select Semester , invalid selection of Semester", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            if ((validator.isFloat(CGPA, { min: '1.0', max: '4.0' })) === false) {
                throw { code: 400, info: "Invalid CGPA Number", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(DOB)) {
                throw { code: 400, info: "Invalid Date of Birth ", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            if (validator.isEmpty(gender)) {
                throw { code: 400, info: "Please select Gender, invalid Selection of Gender", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            if ((validator.isAlphanumeric(address, ['en-US'], { ignore: '-s/:/,/#/.//' }) && validator.isLength(address, { min: '10', max: '120' })) === false) {
                throw { code: 400, info: "Invalid Address, Please follow tips", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            if ((validator.isURL(linkedin) && validator.contains(linkedin, "linkedin.com/")) === false) {
                throw { code: 400, info: "Invalid linkedin URL, please follow tips", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            if ((validator.isURL(github) && validator.contains(github, "github.com/")) === false) {
                throw { code: 400, info: "Invalid github URL, please follow tips", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            if ((!validator.isEmpty(aboutUs) && validator.isLength(aboutUs, { min: '1', max: '400' })) === false) {
                throw { code: 400, info: "Invalid about us data, It's not optional please follow tips", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }

            next();
        }
        else if (clientName == 'industry') { // for industry data checking
            if (validator.isMobilePhone(phoneNumber, ['en-PK'], { strictMode: true }) === false) {
                throw { code: 400, info: "Invalid Mobile Number", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
                
            }
            if ((validator.isAlphanumeric(address, ['en-US'], { ignore: '-s/:/,/#/.//' }) && validator.isLength(address, { min: '10', max: '120' })) === false) {
                throw { code: 400, info: "Invalid Address", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
               
            }
            if ((validator.isURL(linkedin) && validator.contains(linkedin, "linkedin.com/")) === false) {
                throw { code: 400, info: "Invalid linkedin URL", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
               
            }
            if ((!validator.isEmpty(aboutUs) && validator.isLength(aboutUs, { min: '1', max: '400' })) === false) {
                throw { code: 400, info: "Invalid about us data", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
               
            }
            if ((validator.isURL(website)) === false) {
                throw { code: 400, info: "Invalid website URL", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
               
            }
            if (validator.isAlpha(hrName) && validator.isLength(hrName, { min: 2, max: 30 }) === false) {
                throw { code: 400, info: "Invalid HR Name", Error: new Error("Error occurs during validating basic info of profile (function name : basicInfoValidation  )") }
            }
            next();


        }
    }
    catch (e) {
        e.code ? res.status(e.code).send(e.info) : res.status(400).send("Something wrong on Validation");
    }


}


const messageValidation = async (req, res, next)  =>{

    const {  message  } = req.body;

    const { fullName, email, messageData} = message;

        try{
            
            //normalization of input data
            try{
            req.body.message.email  = validator.normalizeEmail(email ,{all_lowercase: true });
            }
            catch{
                throw { code: 400, info: "Invalid Email" }
            }             
            if(!validator.isEmail(email)){
                throw { code: 400, info: "Invalid Email" }
            }
            if( !validator.isByteLength(fullName,{min:4, max:50 } ) ){
                throw { code: 400, info: "Invalid Name, length should be in between 4 to 50" }
            }
            if( !validator.isByteLength(messageData,{min:4, max:200 } ) ){
                throw { code: 400, info: "Invalid Message, length should be in between 10 to 200" }
            }
            
            next();
            
        }
        catch {
             e.code ? res.status(e.code).send(e.info) : res.status(400).send("Something wrong on Validation");
        }
  

}




const jobValidation = async (req, res, next)  =>{

    const {  jobRequest  } = req.body;

    const { tittle, duration, location, description } = jobRequest;

        try{
            
            //normalization of input data
            if( !(location ==="Remote" || "Onsite" ) ){
                throw { code: 400, info: "Invalid Location" }
            }           
            if( !(duration ==="Full Time" || "Part Time" ) ){
                throw { code: 400, info: "Invalid Duration" }
            }
            if( !validator.isByteLength(tittle,{min:4, max:50 } ) ){
                throw { code: 400, info: "Invalid Tittle, length should be in between 4 to 50" }
            }
            if( !validator.isByteLength(description,{min:4, max:600 } ) ){
                throw { code: 400, info: "Message length, should be in between 10 to 600" }
            }
           
            next();
            
        }
        catch(e) {
             e.code ? res.status(e.code).send(e.info) : res.status(400).send("Try Again!");
        }
  

}
const jobPostValidation = async (req, res, next)  =>{

        const {  jobPostData  } = req.body;

        const { tittle, duration, location, skill, linkedin, description  } =jobPostData;

        try{
            
            //normalization of input data
            if( !(location ==="Remote" || "Onsite" ) ){
                throw { code: 400, info: "Invalid Location" }
            }           
            if( !(duration ==="Full Time" || "Part Time" ) ){
                throw { code: 400, info: "Invalid Duration" }
            }
            if( !validator.isByteLength(tittle,{min:4, max:50 } ) ){
                throw { code: 400, info: "Invalid Tittle, length should be in between 4 to 50" }
            }
            if( !validator.isByteLength(description,{min:4, max:600 } ) ){
                throw { code: 400, info: "Message length, should be in between 10 to 600" }
            }
            if( ! (typeof(skill)=="object" && skill.length >0) ){
                throw { code: 400, info: "Please select Skill" }
            }
            next();
            
        }
        catch(e) {
             e.code ? res.status(e.code).send(e.info) : res.status(400).send("Try Again!");
        }
  

}
module.exports = {loginDataValidation, signUpDataVaidation, commonDataValidation, basicInfoValidation , messageValidation, jobValidation , jobPostValidation};