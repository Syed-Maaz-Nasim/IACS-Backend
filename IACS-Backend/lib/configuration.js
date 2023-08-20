require('dotenv').config();

function conf(){
    // cookie Configuration
    // const maxAge = 1000 * parseInt(process.env.maxAge, 10) ;
    const secure = process.env.secure == 'true';
    const domain = process.env.domain;
    const httpOnly = process.env.httpOnly == 'true';
    const sameSite = process.env.sameSite == 'None' ? false : 'Strict' ;
    const signed = process.env.signed == 'true';
    const path = '/';
    
    //json Token
    const accExpiresIn  = parseInt( process.env.accessTokenExpireTime, 10 ) *60*1000;
    const refExpiresIn  = parseInt( process.env.refreshTokenExpireTime, 10 );
    const accKey        = process.env.accKey;
    const refKey        = process.env.refKey;
    const adminEmail    = process.env.AdminEmail;
    const adminPassword = process.env.adminPassword;

    //for otp encrytion
    const encKey = process.env.encKey;
    
    //for ip 
    const ip = process.env.hostName;

    //passHashing
    const saltRound = parseInt(process.env.hashRound,10);

    const confObject ={
        cookieConfig : {
            domain,
            path,
            secure,
            // maxAge,
            httpOnly,
            sameSite,
            signed
        },
         publicIp:{
            ip
        }
        , jsonConfig :{
            accExpiresIn,
            refExpiresIn,
            accKey   ,
            refKey  
        }
        , bcrypt : {
            saltRound
        }    
        , otp : {
            encKey,
        },cloudinary: {
            url:"http://res.cloudinary.com/dksfpant5/image/upload/",
        }, 
        admin:{
            email    : adminEmail ,
            password : adminPassword , 
        }
    };
    // console.log(confObject);
    return confObject 
}

module.exports={conf};