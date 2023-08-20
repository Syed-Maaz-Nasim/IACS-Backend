let jwt = require('jsonwebtoken');
const { generateTknTime } = require('../lib/token');


const genJsonToken = async (req, res, next) => {

  const { accExpiresIn, accKey, refKey } = req.body.config.jsonConfig;
  const { tokenData, username, clientName } = req.body;

  // refresh token - for authorization
  jwt.sign(tokenData, refKey, function (err, refToken) {
    if (!err) {
      req.body.refToken = refToken;

      // access token - for resources access   
      const accTknData = { clientName, id: tokenData.id };
      jwt.sign(accTknData, accKey, { expiresIn: accExpiresIn / 1000 }, function (err, accToken) {
        if (!err) {
          req.body.accToken = accToken;
          next();
        } else {
          res.status(500).end();
        }
      });
    }
    else {
      res.status(500).end();
    }
  });
}



const genAdminJsonToken = async (req, res, next) => {

  
  const { refExpiresIn } = req.body.config.jsonConfig;
  let { iat, exp} = generateTknTime(refExpiresIn);
  const { clientName } = req.body;
  req.body.tokenData = {
   clientName, iat, exp
  }

  const { accExpiresIn, accKey, refKey } = req.body.config.jsonConfig;
  const { tokenData } = req.body;

  // refresh token - for authorization
  jwt.sign(tokenData, refKey, function (err, refToken) {
    if (!err) {
      req.body.refToken = refToken;

      // access token - for resources access   
      const accTknData = { clientName };
      jwt.sign(tokenData, accKey,  function (err, accToken) {
        if (!err) {
          req.body.accToken = accToken;
          next();
        } else {
          res.status(500).end();
        }
      });
    }
    else {
      res.status(500).end();
    }
  });
}

const OTPjsonToken = async (req, res, next) => {

  const { tokenData } = req.body;
  const key = req.body.config.otp.encKey;

  jwt.sign(tokenData, key, function (err, token) {

    if (!err) {
      req.body.token = token;
      // res.status(200).send( {token} );
      // console.log(token);
      next();
    }
    else {
      res.status(500).end();
      // console.log(err);
    }

  });
}

const decodeOTPToken = async (req, res, next) => {

  const { token } = req.body;
  const key = req.body.config.otp.encKey;


  jwt.verify(token, key, function (err, decoded) {

    if (!err) {
      req.body = {
        ...req.body,
        ...decoded
      }

      // res.status(200).send({ token });
      // console.log(token);
      next();
    }
    else {
      res.status(500).end("Invalid Token");
      console.log(err);
    }
  });
}

const decodejsonToken = async (req, res, next) => {

  //  console.log("cookie found");
  const { refKey } = req.body.config.jsonConfig;
  const token = req.body.refToken;

  jwt.verify(token, refKey, function (err, decoded) {
    if (err) {
      return null;
    } else {
      req.body.refTokenData = decoded;
      next();
    }
  });
}

const decodeBothjsonToken = async (req, res, next) => {

  //  console.log("cookie found");
  const { refKey, accKey } = req.body.config.jsonConfig;
  const Rtoken = req.body.refToken;
  const Atoken = req.body.accToken;
  let tokenData;
  try {
    jwt.verify(Rtoken, refKey, function (err, decoded) {
      if (err) {
        throw new err(null)
      } else {
        tokenData = { refTokenData: { ...decoded } };
      }
    });

    jwt.verify(Atoken, accKey, function (err, decoded) {
      if (err) {
        req.body = { ...req.body, ...tokenData }
        next();
      } else {
        res.status(200).send("already exist both token");
      }
    });
  }
  catch {
    res.status(400).send("Invalid Token");
  }

}

const generateAccTkn = async (req) => {

  const { id, clientName }       = req.body.refTokenData;
  const { accKey, accExpiresIn } = req.body.config.jsonConfig;
  // const   Atoken   = req.body.accToken;

  const accTknData = { clientName, id };
  // let returnData = new promises()

  

  return new Promise( resolve => {
      jwt.sign(accTknData, accKey, { expiresIn: accExpiresIn / 1000 }, function (err, token) {

        if (err) {
          resolve({ code: 500, info: "Error in generating Access token", Error: new Error("Try again later") })
        }
        else {
          resolve(token);
        }
      })
    })

  
  

  // return  returnData;

}

const decodeAccTkn = async (req, res, next) =>{

  const { accKey } = req.body.config.jsonConfig;
  const Atoken = req.body.accToken;

  jwt.verify(Atoken, accKey, function (err, decoded) {
    if (err) {
      res.status(401).send("Expire or invalid");
    } else {
      req.body = { ...req.body, accTokenData: { ...decoded } };
      next();
    }
  });

}

module.exports = { genJsonToken, decodeOTPToken, OTPjsonToken, genAdminJsonToken, decodejsonToken, decodeBothjsonToken, generateAccTkn, decodeAccTkn };
// console.log('key'+require('crypto').randomBytes(64).toString('hex'))