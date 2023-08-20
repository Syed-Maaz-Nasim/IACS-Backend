const fs = require('fs')
const { auth } = require('googleapis/build/src/apis/abusiveexperiencereport');
let jwt = require('jsonwebtoken');

const { authorization } = require('./middleware/authentication')

fun =  () => {

    const arr = ["dj","fj"];
    console.log(typeof(arr)== "object")
    // try{
         
    //     throw { code: 500, info: "Error in generating Access token", Error: new Error("Try again later") }
    //     // throw new { phoneNumber: "Invalid Mobile Number, Please follow tips <br/>" }

    // }
    // catch(e){
            
    //     console.log("lllllllll")
    //     console.log("lllllllll")
    //     console.log(e)
    //     console.log("lllllllll")
    //     console.log("lllllllll")
    // }

    // const basicInfo={Data : {
    //     id         : "62",
    //     clientName : "student"
    //   }};
    // console.log( JSON.stringify(basicInfo) )
// const data = fs.readFileSync('./IMG_20191029_175656.JPG');
// console.log(data)
    // const tokenData = { data: "data", 
    // exp: Math.floor(Date.now() / 1000) + (5)};
    // const key = "fdskskskskksk";
    // let token;

    // jwt.sign(tokenData, key, function (err, token1) {

    //     if (!err) {
    //         token = token1;
    //           console.log(token1);
    //         // console.log(token);

    //         // token = ""
    //         jwt.verify(token, key, function (err, decoded) {
    //             if (err) {
                    
    //                 console.log(err);
                    
    //                 jwt.verify(token, key, {ignoreExpiration:true},function (err, decoded) {
    //                     if (!err) {
    //                         console.log(decoded);
    //                     }
    //                 });


    //                 // console.log(err.message=='jwt expired');
    //             } else {
    //                 console.log(decoded);
    //             }
    //         });

    //     }
    //     else {
    //         //   console.log(err);
    //     }

    // });
    // updateBasicInfo: `create or replace NONEDITIONABLE PROCEDURE UPDATEBASICINFO(
    //     Uid            IN DECIMAL,
    //     clientNam      IN varchar2,
    //     mobileNumber   IN varchar2, 
    //     enrlment       IN varchar2,
    //     depart         IN varchar2,
    //     yr             IN varchar2,
    //     smster         IN varchar2,
    //     GPA            IN varchar2,
    //     birthday       IN varchar2,
    //     gndr           IN varchar2,
    //     addr           IN varchar2,
    //     githubLink     IN varchar2,
    //     linkedinLink   IN varchar2,
    //     aboutUs        IN varchar2,
    //     firstName      IN varchar2,
    //     lastName       IN varchar2,
    //     emailAddr      IN varchar2,
    //     uni            IN varchar2,
    //     isInserted     OUT BOOLEAN
    // )
        
    // IS
    // BEGIN
    
    // IF clientNam  = 'student' THEN   
    
    // UPDATE STUDENT
    // SET FNAME = firstName, LNAME= lastName, EMAIL =emailAddr, ENROLLMENT = enrlment  , CGPA = GPA  ,  DEPARTMENT = depart     ,  UNIVERSITY = uni,
    // PHONENUMBER = mobileNumber ,  YEAR = yr  ,  SEMESTER=smster, DOB =  birthday,  ADDRESS = addr, GENDER = gndr ,  BIO = aboutUs
    // where ID = Uid;
    // COMMIT;
    // isinserted := true;
    
    // ELSE  
    
    // END UPDATEBASICINFO;`,



    
    // const findSession = async () =>{
        


    // }
    
    // class authorization{
        
    //      constructor() {

    //          new refresher()
            
    //     }


    // }
    
    // class refresher {
        
    //     constructor() { this.findSession() }
        
        
        
    //     findSession =  () => {
            
    //        throw {Error : new Error("SingIn Needed") , code : 1}

    //     }
        
    // }

    // // let req,res;
    // // ( {req,res} = {req:{name: "waqar"},res:{name: "Ali"}} )
    // // console.log(req,res)
    // // console.log(typeof("hfhr")== "string");
    // // const clas = new refresher();
    // // clas.findSession();

    // try{
    // const auth = new authorization();
         
    // }
    // catch (err) {
    //     console.log(err.Error.message)
    // }

}

module.exports = fun;

