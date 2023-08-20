const { libPath, PDBcon, SQL, storedProcedures } = require('./lib/DBcon');
const { generateTknTime } = require('../lib/token');
const fs = require('fs');
const { bindsOut, bindsIn } = require('./lib/DatabaseLayer');
require('dotenv').config();
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME      ,
  api_key   : process.env.CLOUDINARY_API_KEY   ,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const state = { updated: "updated", modified: "modified", empty: null, available: "available", deleted: "deleted", deletedAll: "deletedAll", Add: "added" }


var databaseInitialize = async (oracledb) => {
  if (libPath.path && fs.existsSync(libPath.path)) {
    oracledb.initOracleClient({ libDir: libPath.path });
  }
  else {
    console.log("invalid client path " + libPath.path);
  }

  //output of query will be in Object format
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  // oracledb.autoCommit=true;

  await oracledb.createPool(PDBcon)
    .then(() => { console.log("pool created") })
    .catch((err) => {
      console.log(err);
    });


  await connection(oracledb)
    // await oracledb.getConnection(PDBcon.poolAlias)
    .then(
      async (conn) => {
        // for initialization of storeProcedures
        conn.execute(storedProcedures.loginDataValidation);
        conn.execute(storedProcedures.addUser);
        conn.execute(storedProcedures.findSession);
        conn.execute(storedProcedures.addSession);
        conn.execute(storedProcedures.deleteSession);
        conn.execute(storedProcedures.deleteAllSessions);
        await doRelease(conn);
      }).catch(
        (err) => {
          console.log(" error in making connection initialization");
          console.log(err);
        });

  // for checking pool name   
  // console.log(await oracledb.getPool(PDBcon.poolAlias).poolAlias)
  return oracledb;
}

const storeSession = async (req, res, next) => {

  let { id, clientName, Database } = req.body;
  const { refExpiresIn } = req.body.config.jsonConfig;
  let { iat, exp, sessionID } = generateTknTime(refExpiresIn);
  const device = req.cookies._device || 'unknown';


  let bindData = {
    id: await bindsIn(id),
    clientName: await bindsIn(clientName),
    device: await bindsIn(device),
    iat: await bindsIn(iat),
    exp: await bindsIn(exp),
    isInserted: await bindsOut('OUT', 'boolean')  //return true if data insert 
  };

  Database.executeQuery(SQL.addSession, bindData).then(
    async (result) => {
      if (!result.outBinds.isInserted) {
        res.status(400).end();
      }
      else {
        req.body.tokenData = {
          id, clientName, device, iat, exp
        }
        next();
      }
    }).catch(
      async (err) => {
        res.status(500).end();
        console.log(err);
      });
}







const DBvalidation = async (req, res, next) => {
  const { email, clientName, Database } = req.body;

  const bindData = {
    clientName: await bindsIn(clientName),
    email: await bindsIn(email),
    id: await bindsOut('OUT', 'Number', { types: 'maxSize', value: 20 }),
    username: await bindsOut('OUT', 'String', { types: 'maxSize', value: 30 }),
    passwordHash: await bindsOut('OUT', 'String', { types: 'maxSize', value: 75 }),
    isDataFound: await bindsOut('OUT', 'boolean') //return true if data found
  }

  await Database.executeQuery(SQL.query1, bindData)
    .then(async (result) => {
      if (!result.outBinds.isDataFound) {

        res.status(401).end();
      }
      else {
        req.body = {
          ...result.outBinds,
          ...req.body
        }
        next();
      }
    })
    .catch(async (err) => {
      res.status(500).end();
      console.log(err);
    });
}













const addUser = async (req, res, next) => {

  const { email, passwordHash, fname, lname, year, semester, enrollment, Database, clientName, CGPA, department, university, phoneNumber } = req.body;
  const { companyName, hrName, cnic, city, country } = req.body;

  req.body.username = companyName || `${fname} ${lname}`;
  console.log({ ...req.body });

  let bindData = {
    hrName: await bindsIn(hrName || 'random'),
    cnic: await bindsIn(cnic || 'random'),
    city: await bindsIn(city || 'random'),
    country: await bindsIn(country || 'random'),
    CGPA: await bindsIn(CGPA || 'random'),
    department: await bindsIn(department || 'random'),
    university: await bindsIn(university || 'random'),
    phoneNumber: await bindsIn(phoneNumber || 'random'),
    organizationName: await bindsIn(companyName || 'random'),
    enrollment: await bindsIn(enrollment || 'random'),
    fname: await bindsIn(fname || 'random'),
    lname: await bindsIn(lname || 'random'),
    year: await bindsIn(year || 'random'),
    semester: await bindsIn(semester || 'random'),
    clientName: await bindsIn(clientName),
    email: await bindsIn(email),
    passwordHash: await bindsIn(passwordHash),
    id: await bindsOut('OUT', 'Number'),
    isAlready: await bindsOut('OUT', 'boolean')  //return true if data found 
  };

  Database.executeQuery(SQL.query2, bindData)
    .then(
      async (result) => {
        if (result.outBinds.isAlready) {
          res.status(401).end("Email Already Exist");
        } else {
          req.body = {
            id: result.outBinds.id,
            ...req.body
          }
          next();
        }
      }).catch(
        async (err) => {
          res.status(500).end();
          console.log(err);
        });
}

const deleteUserSession = async (req, res, next) => {
  const { refTokenData, Database } = req.body;
  const { id, clientName, iat } = refTokenData;
  // console.log(refTokenData);

  const bindData = {
    id: await bindsIn(parseInt(id, 10)),
    clientName: await bindsIn(clientName),
    iat: await bindsIn(iat),
  }


  Database.executeQuery(SQL.deleteSession, bindData)
    .then(async (result) => {
      res.status(200).end();
    })
    .catch(async (err) => {
      console.log(err);
    });
}

const deleteAllUserSession = async (req, res, next) => {
  const { refTokenData, Database } = req.body;
  const { id, clientName } = refTokenData;
  // console.log(refTokenData);

  const bindData = {
    id: await bindsIn(parseInt(id, 10)),
    clientName: await bindsIn(clientName),
  }


  Database.executeQuery(SQL.deleteAllSessions, bindData)
    .then(async (result) => {
      res.status(200).end();
    })
    .catch(async (err) => {
      console.log(err);
    });
}

const findSession = async (req) => {
  const { id, clientName, iat, exp } = req.body.refTokenData;
  const { Database } = req.body;

  const bindData = {
    id: await bindsIn(parseInt(id, 10)),
    clientName: await bindsIn(clientName),
    iat: await bindsIn(iat),
    exp: await bindsIn(exp),
    isfound: await bindsOut('OUT', 'boolean') //return true if data found
  }

  let returnData;
  await Database.executeQuery(SQL.findSession, bindData)
  .then(async (result) => {
    
    returnData = result.outBinds.isfound;
    
  })
  .catch(async (err) => {
    returnData = { code: 1001, DatabaseMsg: err.message, info: "Query for finding session", Error: new Error("Database Error") }
  });
  
  
  return returnData;
}

const basicInfo = async (req, res) => {
  try {

    const { id, clientName } = req.body.refTokenData;
    const { Database } = req.body;
    const bindData = {
      id: await bindsIn(parseInt(id, 10)),
      clientName:  await bindsIn(clientName),
      phoneNumber: await bindsOut('OUT', 'String', { types: 'maxSize', value: 20 }),
      enrollment: await bindsOut('OUT', 'String', { types: 'maxSize', value: 20 }),
      department: await bindsOut('OUT', 'String', { types: 'maxSize', value: 10 }),
      year: await bindsOut('OUT', 'String', { types: 'maxSize', value: 1 }),
      semester: await bindsOut('OUT', 'String', { types: 'maxSize', value: 1 }),
      CGPA: await bindsOut('OUT', 'String', { types: 'maxSize', value: 6 }),
      DOB: await bindsOut('OUT', 'Date'),
      gender: await bindsOut('OUT', 'String', { types: 'maxSize', value: 1 }),
      address: await bindsOut('OUT', 'String', { types: 'maxSize', value: 100 }),
      github: await bindsOut('OUT', 'String', { types: 'maxSize', value: 200 }),
      linkedin: await bindsOut('OUT', 'String', { types: 'maxSize', value: 200 }),
      aboutUs: await bindsOut('OUT', 'String', { types: 'maxSize', value: 200 }),
      fname: await bindsOut('OUT', 'String', { types: 'maxSize', value: 10 }),
      lname: await bindsOut('OUT', 'String', { types: 'maxSize', value: 10 }),
      email: await bindsOut('OUT', 'String', { types: 'maxSize', value: 50 }),
      university: await bindsOut('OUT', 'String', { types: 'maxSize', value: 15 }),
    }

    return new Promise((resolve, reject) => {
      Database.executeQuery(SQL.basicInfo, bindData)
        .then(async (result) => {
          // console.log(result.outBinds)
          resolve(
            res.status(200).send(result.outBinds)
          );
        })
        .catch(async (err) => {
          resolve(
            res.status(400).send(
              {
                code: 1005, DatabaseMsg: err.message,
                info: "Query for getting client basic info",
                Error: new Error("error while query execution")
              }
            )
          );
        });
    });

  }
  catch (e) {
   
      res.status(400).send("Unable to process Data")
  }
}

const updateBasicInfo = async(req,res)=>{
  
  const { id, clientName } = req.body.refTokenData;

  const {  basicInfo , Database } = req.body;
  const {  phoneNumber,  enrollment,  department,  year,  semester,  CGPA,  DOB,  gender,  address,  github,  linkedin,  aboutUs,  fname,  lname,  email,  university} = basicInfo;

  const Datebirth = new Date(DOB);
  const date =`${Datebirth.getDate()}/${Datebirth.getMonth() + 1}/${Datebirth.getFullYear()}` 
 
  const bindData = {
    id          : await bindsIn(parseInt(id, 10)),
    clientName  : await bindsIn(clientName ),
    phoneNumber : await bindsIn(phoneNumber),
    enrollment  : await bindsIn(enrollment ),
    department  : await bindsIn(department ),
    year        : await bindsIn(year       ),
    semester    : await bindsIn(semester   ),
    CGPA        : await bindsIn(CGPA       ),
    DOB         : await bindsIn(date       ),
    gender      : await bindsIn(gender     ),
    address     : await bindsIn(address    ),
    github      : await bindsIn(github     ),
    linkedin    : await bindsIn(linkedin   ),
    aboutUs     : await bindsIn(aboutUs    ),
    fname       : await bindsIn(fname      ),
    lname       : await bindsIn(lname      ),
    email       : await bindsIn(email      ),
    university  : await bindsIn(university ),
    isInserted  : await bindsOut('OUT', 'boolean')
  }


  await Database.executeQuery(SQL.updateBasicInfo, bindData)
    .then(async (result) => {
      // console.log(result.outBinds)
      res.status(200).send(result.outBinds)
    })
    .catch(async (err) => {
      res.status(400).send(
        {
          code: 1005, DatabaseMsg: err.message,
          info: "Query for getting client basic info",
          Error: new Error("error while query execution")
        }
      )

    });

}

const skillOption = async(req,res)=>{
  
  // const {id, clientName} = req.body.refTokenData;
  const { Database } = req.body;
  const bindData = [];



  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.skillOptons, bindData)
      .then(async (result) => {
        
        let skillOption = (result.rows).map((skill) => {
          return { status: state.Add, title: skill.SKILLNAME }
        });
        resolve(
          res.status(200).send(skillOption)
        );
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}

const stdSkill = async(req,res)=>{
  
  const { id } = req.body.refTokenData;

  const { Database } = req.body;
  // const id  = 61;
  
  
  const bindData = {
    id          : await bindsIn(parseInt(id, 10))
   };

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.stdSkill, bindData)
      .then(async (result) => {
        
        let skillOption = (result.rows).map((skill) => {
          return { status: state.available, title: skill.SKILLNAME }
        });

        resolve(
          res.status(200).send(skillOption)
        );
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}

const updateSkill = async(req,res)=>{

  try {
    
    const { id } = req.body.refTokenData;
    const { skills, Database } = req.body;

    let deletedSkill =[]; 
    skills.forEach((skill) => {
      if (skill.status == state.deleted) {
        deletedSkill.push(skill.title);
      }
    });

    let addedSkill=[];
    skills.forEach((skill) => {
      if (skill.status == state.Add) {
        addedSkill.push( skill.title);
      }
    });

    const bindData = {
      id: await bindsIn(parseInt(id, 10)),
      dSkill: {
        type: "ARR",
        val:deletedSkill
      }, 
      aSkill: {
        type: "ARR",
        val:addedSkill
      },
      isUpdated: await bindsOut('OUT', 'boolean')
    }

    await Database.executeQuery(SQL.updateSkill, bindData)
      .then(async (result) => {
        res.status(200).send(result.outBinds)
      })
      .catch(async (err) => {
        throw {
          code: 1007, DatabaseMsg: err.message,
          info: "Query for getting client basic info",
          Error: new Error("error while query execution")
        } 

      });
  }
  catch(e){
    if(e.code == 1007){
      res.status(400).send( {...e} )
    }else{
      res.status(400).send( "Unable to process Data" )
      console.log(e)
    }
  }

}

const stdExperience = async(req,res)=>{
  
  const { id } = req.body.refTokenData;
  const { Database } = req.body;
  // const id  = 61;
  
  const bindData = {
    id    : await bindsIn(parseInt(id, 10))
   };

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.stdExperience, bindData)
      .then(async (result) => {
        
        let experience = (result.rows).map((exp) => {
          return { eid: exp.ID, companyName: exp.CNAME, jobRole: exp.JOBROLE, startDate: exp.STARTDATE, endDate: exp.ENDDATE, Description: exp.DESCRIPTION }
        });

        resolve(
          res.status(200).send(experience)
        );
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}

const addExperience = async(req,res)=>{

  try {
    const { id } = req.body.refTokenData;
    // const id  = 61;

    const { experience, Database } = req.body;
    let {eid, companyName, jobRole, startDate, endDate, Description} = experience;

    const Date1 = new Date(startDate);
    const Date2 = new Date(endDate);
    startDate =`${Date1.getDate()}/${Date1.getMonth() + 1}/${Date1.getFullYear()}` 
    endDate =`${Date2.getDate()}/${Date2.getMonth() + 1}/${Date2.getFullYear()}` 

    const bindData = {
      id           :await bindsIn(parseInt(id, 10)),
      eid          :await bindsIn(eid),// experience id
      com          :await bindsIn( companyName ),
      job          :await bindsIn( jobRole ),
      des          :await bindsIn( Description ),
      SD           :await bindsIn( startDate ),
      ED           :await bindsIn( endDate ),
      isInserted   :await bindsOut('OUT', 'boolean')
    }
    // console.log(bindData);


    await Database.executeQuery(SQL.addExperience, bindData)
      .then(async (result) => {
        res.status(200).send(result.outBinds)
      })
      .catch(async (err) => {
        throw {
          code: 1008, DatabaseMsg: err.message,
          info: "Query for getting client basic info",
          Error: new Error("error while query execution")
        } 

      });
  }
  catch(e){
    if(e.code == 1007){
      res.status(400).send( {...e} )
    }else{
      res.status(400).send( "Unable to process Data" )
      console.log(e)
    }
  }

}

const modifyExperience = async(req,res)=>{

  try {
    const { id } = req.body.refTokenData;
    // const id  = 61;

    const { experience, Database } = req.body;
    let {eid, companyName, jobRole, startDate, endDate, Description} = experience;

    const Date1 = new Date(startDate);
    const Date2 = new Date(endDate);
    startDate =`${Date1.getDate()}/${Date1.getMonth() + 1}/${Date1.getFullYear()}` 
    endDate =`${Date2.getDate()}/${Date2.getMonth() + 1}/${Date2.getFullYear()}` 

    const bindData = {
      id           :await bindsIn(parseInt(id, 10)),
      eid          :await bindsIn(eid),// experience id
      com          :await bindsIn( companyName ),
      job          :await bindsIn( jobRole ),
      des          :await bindsIn( Description ),
      SD           :await bindsIn( startDate ),
      ED           :await bindsIn( endDate ),
      isUpdated    :await bindsOut('OUT', 'boolean')
    }

    // console.log(bindData)

    await Database.executeQuery(SQL.modifyExperience, bindData)
      .then(async (result) => {
        res.status(200).send(result.outBinds)
      })
      .catch(async (err) => {
        throw {
          code: 1008, DatabaseMsg: err.message,
          info: "Query for getting client basic info",
          Error: new Error("error while query execution")
        } 

      });
  }
  catch(e){
    if(e.code == 1007){
      res.status(400).send( {...e} )
    }else{
      res.status(400).send( "Unable to process Data" )
      console.log(e)
    }
  }

}

const removeExperience = async(req,res)=>{

  try {
    const { id } = req.body.refTokenData;
    // const id  = 61;

    const { experience, Database } = req.body;
    let {eid} = experience;

    const bindData = {
      id           :await bindsIn(parseInt(id, 10)),
      eid          :await bindsIn(eid),// experience id
      isDELETED    :await bindsOut('OUT', 'boolean')
    }
    // console.log(bindData)


    await Database.executeQuery(SQL.removeExperience, bindData)
      .then(async (result) => {
        // console.log(result)
        res.status(200).send(result.outBinds)
      })
      .catch(async (err) => {
        throw {
          code: 1008, DatabaseMsg: err.message,
          info: "Query for getting client basic info",
          Error: new Error("error while query execution")
        } 

      });
  }
  catch(e){
    if(e.code == 1007){
      res.status(400).send( {...e} )
    }else{
      res.status(400).send( "Unable to process Data" )
      console.log(e)
    }
  }

} 

const updatePicture = async (req,res,next)=>{


  try {

    const { id, clientName } = req.body.refTokenData;
    const { Database } = req.body;

    const fileStr = req.body.data;
    await cloudinary.v2.uploader.upload(fileStr, {
      folder: "IACSImages",
      width: 150,
      public_id: `${clientName}/${id}`,
      crop: "scale",
      overwrite: true,
    }).then(
      async (uploadResponse) => {

        const bindData = {
          uid: await bindsIn(parseInt(id, 10)),
          clientName: await bindsIn(clientName),
          url: await bindsIn(uploadResponse.url.split("upload/").pop()),
          isInserted: await bindsOut('OUT', 'boolean')
        }


        await Database.executeQuery(SQL.updatePicture, bindData)
          .then(async (result) => {
            if(result.outBinds.isInserted){
              res.status(200).send({ url: uploadResponse.url })
            }
            else{
              throw new Error("isInserted: false")
            }
          })
          .catch(async (err) => {
            throw {
              code: 1009, DatabaseMsg: err.message,
              info: "Query for posting image url",
              Error: new Error("error while query execution")
            }

          });
      }
    )
  }
  catch (e) {
    if (e.code == 1007) {
      res.status(400).send({ ...e })
    } else {
      res.status(400).send("Unable to process Data")
      console.log(e)
    }
  }

}

const getPicture = async (req,res,next)=>{
  
  const {id, clientName} = req.body.refTokenData;
  const { Database, config } = req.body;

  
  const bindData = {
    uid: await bindsIn(parseInt(id, 10)),
    clientName: await bindsIn(clientName),
    url: await bindsOut('OUT', 'String', { types: 'maxSize', value: 200 })
  }

  await Database.executeQuery(SQL.getPicture, bindData)
    .then(async (result) => {
      let url = '';
      if (result.outBinds.url != '') {
       
        
        url = result.outBinds.url ? config.cloudinary.url + result.outBinds.url: "";

        res.status(200).send({ url })
      }
      else {
        res.status(200).send({ url })
      }
    })
    .catch(async (err) => {
      throw {
        code: 1010, DatabaseMsg: err.message,
        info: "Query for getting image url",
        Error: new Error("error while query execution")
      }
    });
}


const serviceOption = async(req,res)=>{
  
  const { Database } = req.body;
  const bindData = [];



  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.serviceOption, bindData)
      .then(async (result) => {
        
        let serviceOption = (result.rows).map((service) => {
          return { status: state.Add, title: service.SERVICENAME }
        });

        resolve(
          res.status(200).send(serviceOption)
        );
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}


const indServices = async(req,res)=>{
  
  const { id } = req.body.refTokenData;
  // const id  = 61;

  
  const { Database } = req.body;
  
  
  const bindData = {
    id          : await bindsIn(parseInt(id, 10))
   };

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.indServices, bindData)
      .then(async (result) => {
        
        let haveService = (result.rows).map((service) => {
          return { status: state.available, title: service.SERVICENAME }
        });

        resolve(
          res.status(200).send(haveService)
        );
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}

const updateServices = async(req,res)=>{

  try {
    const { id } = req.body.refTokenData;

    const { services, Database } = req.body;

    let deletedService =[]; 
    services.forEach((service) => {
      if (service.status == state.deleted) {
        deletedService.push(service.title);
      }
    });


    let addedService=[];
    services.forEach((service) => {
      if (service.status == state.Add) {
        addedService.push( service.title);
      }
    });


    const bindData = {
      id: await bindsIn(parseInt(id, 10)),
      dService: {
        type: "ARR",
        val:deletedService
      }, 
      aService: {
        type: "ARR",
        val:addedService
      },
      isUpdated: await bindsOut('OUT', 'boolean')
    }

    await Database.executeQuery(SQL.updateServices, bindData)
      .then(async (result) => {
        res.status(200).send(result.outBinds)
      })
      .catch(async (err) => {
        throw {
          code: 1007, DatabaseMsg: err.message,
          info: "Query for getting client basic info",
          Error: new Error("error while query execution")
        } 

      });
  }
  catch(e){
    if(e.code == 1007){
      res.status(400).send( {...e} )
    }else{
      res.status(400).send( "Unable to process Data" )
      console.log(e)
    }
  }

}

const orgInfo = async (req, res) => {
  try {

    const { id } = req.body.refTokenData;
    const { Database , clientName } = req.body;
    const bindData = {
      id:          await bindsIn(parseInt(id, 10)),
      clientName:  await bindsIn(clientName),
      phoneNumber: await bindsOut('OUT', 'String', { types: 'maxSize', value: 20 }),
      address:     await bindsOut('OUT', 'String', { types: 'maxSize', value: 100 }),
      linkedin:    await bindsOut('OUT', 'String', { types: 'maxSize', value: 200 }),
      aboutUs:     await bindsOut('OUT', 'String', { types: 'maxSize', value: 400 }),
      hrName:      await bindsOut('OUT', 'String', { types: 'maxSize', value: 30 }),
      website:     await bindsOut('OUT', 'String', { types: 'maxSize', value: 200 }),
      orgName:     await bindsOut('OUT', 'String', { types: 'maxSize', value: 70 }),
    }

    return new Promise((resolve, reject) => {
      Database.executeQuery(SQL.orgInfo, bindData)
        .then(async (result) => {
          console.log(result.outBinds)
          resolve(
            res.status(200).send(result.outBinds)
          );
        })
        .catch(async (err) => {
          resolve(
            res.status(400).send(
              {
                code: 1005, DatabaseMsg: err.message,
                info: "Query for getting client basic info",
                Error: new Error("error while query execution")
              }
            )
          );
        });
    });

  }
  catch (e) {
   
      res.status(400).send("Unable to process Data")
  }
}

const updateOrgInfo = async(req,res)=>{
  
  const { id, clientName } = req.body.refTokenData;

  const {  basicInfo , Database } = req.body;
  const {  phoneNumber, address, linkedin,  aboutUs, hrName, website } = basicInfo;
 
  const bindData = {
    id          : await bindsIn(parseInt(id, 10)),
    phoneNumber : await bindsIn(phoneNumber),
    address     : await bindsIn(address    ),
    linkedin    : await bindsIn(linkedin   ),
    aboutUs     : await bindsIn(aboutUs    ),
    hrName      : await bindsIn(hrName     ),
    website     : await bindsIn(website    ),
    isInserted  : await bindsOut('OUT', 'boolean')
  }

  console.log(bindData)

  await Database.executeQuery(SQL.updateOrgInfo, bindData)
    .then(async (result) => {
      console.log(result.outBinds)
      res.status(200).send(result.outBinds)
    })
    .catch(async (err) => {
      res.status(400).send(
        {
          code: 1005, DatabaseMsg: err.message,
          info: "Query for getting client basic info",
          Error: new Error("error while query execution")
        }
      )

    });

}

const MessageStore = async(req, res) => {
  const {  message , Database } = req.body;
  const { fullName, email, messageData} = message;

  const currentDate = new Date(Date.now());
 
  const bindData = {
    currentDate : await bindsIn(currentDate),
    fullName    : await bindsIn(fullName ),
    messageData : await bindsIn(messageData),
    email       : await bindsIn(email      ),
    isInserted  : await bindsOut('OUT', 'boolean')
  }

  await Database.executeQuery(SQL.MessageStore, bindData)
    .then(async (result) => {
      console.log(result.outBinds)
      res.status(200).send(result.outBinds.isInserted)
    })
    .catch(async (err) => {
      res.status(400).send(
        {
          code: 1005, DatabaseMsg: err.message,
          info: "Query for getting client basic info",
          Error: new Error("error while query execution")
        }
      )

    });

}



const getMessage = async(req,res)=>{
  
  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination } = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.getMessage, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.getMessageTotal, []).then( async (result2)=>{

          // console.log({pagination: req.body.pagination, res:{data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)} })
          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}


const getStudentRequest = async(req,res)=>{
  
  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination , config } = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url)

  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.getStudentRequest, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.getStudentRequestTotal, []).then( async (result2)=>{

          // console.log({pagination: req.body.pagination, res:{data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)} })
          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}



const jobRequest = async (req, res) => {

  try {


    const { id, clientName } = req.body.refTokenData;
    const { jobRequest, Database } = req.body;

    if(clientName != "student"){
      throw { code: 400, info: "Invalid request" }
    }

    const { tittle, duration, location,  skill, description , type } = jobRequest;

    const R_DATE = new Date(Date.now());


    const bindData = {
      id:           await bindsIn(parseInt(id, 10)),
      type:         await bindsIn(type),
      tittle:       await bindsIn(tittle),
      duration:     await bindsIn(duration),
      location:     await bindsIn(location),
      description:   await bindsIn(description),
      RDATE:         await bindsIn(R_DATE),
      isInserted:   await bindsOut('OUT', 'boolean')
    }

    await Database.executeQuery(SQL.jobRequest, bindData)
      .then(async (result) => {
        console.log(result.outBinds)
        res.status(200).send(result.outBinds.isInserted)
      })
      .catch(async (err) => {
        throw {
            code: 1005, DatabaseMsg: err.message,
            info: "DATABASE ERROR REQUEST ERROR",
          }
      });

  }
  catch (e) {
    e.code == 400 ? res.status(e.code).send(e.info) : res.status(400).send("Try Again Later");
  }
}

const jobPost = async (req, res) => {

  try {

    const { id, clientName } = req.body.refTokenData;
    const { jobPostData, Database } = req.body;
    const { tittle, duration, location, skill, linkedin, description  } = jobPostData;



    if(clientName != "industry"){
      throw { code: 400, info: "Invalid request" }
    }

    let addedSkill=[];
    skill.forEach((skill) => {
      if (skill.status == state.Add) {
        addedSkill.push( skill.title);
      }
    });
    const p_DATE = new Date(Date.now());


    const bindData = {
      id:           await bindsIn(parseInt(id, 10)),
      tittle:       await bindsIn(tittle),
      duration:     await bindsIn(duration),
      location:     await bindsIn(location),
      skill:       {
                     type: "ARR",
                     val:addedSkill
                    },
      linkedin:     await bindsIn(linkedin), 
      description:   await bindsIn(description),
      PDATE:         await bindsIn(p_DATE),
      isInserted:   await bindsOut('OUT', 'boolean')
    }

    await Database.executeQuery(SQL.jobPost, bindData)
      .then(async (result) => {
        console.log(result.outBinds)
        res.status(200).send(result.outBinds.isInserted)
      })
      .catch(async (err) => {
        throw {
            code: 1005, DatabaseMsg: err.message,
            info: "DATABASE ERROR REQUEST ERROR",
          }
      });

  }
  catch (e) {
    e.code == 400 ? res.status(e.code).send(e.info) : res.status(400).send("Try Again Later");
  }
}

const internsPost = async (req, res) => {

  try {

    const { id, clientName } = req.body.refTokenData;
    const { jobPostData, Database } = req.body;
    const { tittle, duration, location, skill, linkedin, description  } = jobPostData;



    if(clientName != "industry"){
      throw { code: 400, info: "Invalid request" }
    }

    let addedSkill=[];
    skill.forEach((skill) => {
      if (skill.status == state.Add) {
        addedSkill.push( skill.title);
      }
    });
    const p_DATE = new Date(Date.now());


    const bindData = {
      id:           await bindsIn(parseInt(id, 10)),
      tittle:       await bindsIn(tittle),
      duration:     await bindsIn(duration),
      location:     await bindsIn(location),
      skill:       {
                     type: "ARR",
                     val:addedSkill
                    },
      linkedin:     await bindsIn(linkedin), 
      description:   await bindsIn(description),
      PDATE:         await bindsIn(p_DATE),
      isInserted:   await bindsOut('OUT', 'boolean')
    }

    await Database.executeQuery(SQL.internsPost, bindData)
      .then(async (result) => {
        console.log(result.outBinds)
        res.status(200).send(result.outBinds.isInserted)
      })
      .catch(async (err) => {
        throw {
            code: 1005, DatabaseMsg: err.message,
            info: "DATABASE ERROR REQUEST ERROR",
          }
      });

  }
  catch (e) {
    e.code == 400 ? res.status(e.code).send(e.info) : res.status(400).send("Try Again Later");
  }
}

const getStudent = async(req,res)=>{
  
  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config } = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url)
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.getStudent, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.getTotalStudent, []).then( async (result2)=>{

          // console.log({pagination: req.body.pagination, res:{data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)} })
          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}

const searchByUniversity = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , university} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    universityQuery    : await bindsIn(`%${university.query}%`),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryUniversity, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryUniversityTotal, {universityQuery: bindData.universityQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}

const searchByName = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , name} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    nameQuery   : await bindsIn(`%${name.query}%`),
  }
  console.log(bindData)

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryName, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryNameTotal, {nameQuery: bindData.nameQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}

const searchByYear = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , year} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    yearQuery   : await bindsIn(`%${year.query}%`),
  }
console.log(bindData)
  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryYear, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryYearTotal, {yearQuery: bindData.yearQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}

const searchByDepart = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , depart} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    departQuery   : await bindsIn(`%${depart.query}%`),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryDepart, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryDepartTotal, {departQuery: bindData.departQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}

const searchBySkill = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , skill} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    skillQuery         : await bindsIn(`%${skill.query}%`),
  } 

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.querySkill, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.querySkillTotal, {skillQuery: bindData.skillQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}


const getJob = async(req,res)=>{
  
  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config } = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url)
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.getJob, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.getTotalJob, []).then( async (result2)=>{

          // console.log({pagination: req.body.pagination, res:{data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)} })
          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}

const jobSkill = async(req,res)=>{
  
  const { id } = req.body.refTokenData;

  const { Database } = req.body;
  
  
  const bindData = {
    id          : await bindsIn(parseInt(id, 10))
   };

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.jobSkill, bindData)
      .then(async (result) => {
        
        let skillOption = (result.rows).map((skill) => {
          return { status: state.available, title: skill.SKILLNAME }
        });

        resolve(
          res.status(200).send(skillOption)
        );
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}


const searchBycompanyName = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , companyName} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    companyNameQuery    : await bindsIn(`%${companyName.query}%`),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryCompanyName, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryCompanyNameTotal, {companyNameQuery: bindData.companyNameQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}


const searchByAddress = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , address} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    addressQuery        : await bindsIn(`%${address.query}%`),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryAddress, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryAddressTotal, {addressQuery: bindData.addressQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}

const searchBylocation = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , location} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    locationQuery        : await bindsIn(`%${location.query}%`),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryLocation, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryLocationTotal, {locationQuery: bindData.locationQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}


const searchByJobSkill = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , skill} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    skillQuery         : await bindsIn(`%${skill.query}%`),
  } 

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryJobSkill, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryJobSkillTotal, {skillQuery: bindData.skillQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}



const searchBytittle = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , tittle} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    tittleQuery        : await bindsIn(`%${tittle.query}%`),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryTittle, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryTittleTotal, {tittleQuery: bindData.tittleQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}


const getSoftwareHouse = async(req,res)=>{
  
  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config } = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url)
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.getSoftwareHouse, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.getTotalSoftwareHouse, []).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}

const searchByIndusAddress = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , address} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    addressQuery        : await bindsIn(`%${address.query}%`),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryIndusAddress, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryIndusAddressTotal, {addressQuery: bindData.addressQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}


const  searchByIndusCompanyName = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , companyName} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    companyNameQuery   : await bindsIn(`%${companyName.query}%`),
  }
  console.log(bindData)

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryIndusCompanyName, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryIndusCompanyNameTotal, {companyNameQuery: bindData.companyNameQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}


const searchByIndusService = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , services} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    servicesQuery         : await bindsIn(`%${services.query}%`),
  } 

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.queryIndusServices, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.queryIndusServicesTotal, {servicesQuery: bindData.servicesQuery}).then( async (result2)=>{

          console.log(result2)
          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}






const getIntern = async(req,res)=>{
  
  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config } = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url)
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.InterngetJob, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.InterngetTotalJob, []).then( async (result2)=>{

          // console.log({pagination: req.body.pagination, res:{data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)} })
          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}

const InternSkill = async(req,res)=>{
  
  const { id } = req.body.refTokenData;

  const { Database } = req.body;
  
  
  const bindData = {
    id          : await bindsIn(parseInt(id, 10))
   };

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.InternjobSkill, bindData)
      .then(async (result) => {
        
        let skillOption = (result.rows).map((skill) => {
          return { status: state.available, title: skill.SKILLNAME }
        });

        resolve(
          res.status(200).send(skillOption)
        );
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}


const searchByInterncompanyName = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , companyName} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    companyNameQuery    : await bindsIn(`%${companyName.query}%`),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.InternqueryCompanyName, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.InternqueryCompanyNameTotal, {companyNameQuery: bindData.companyNameQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}


const searchByInterntittle = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , tittle} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    tittleQuery        : await bindsIn(`%${tittle.query}%`),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.InternqueryTittle, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.InternqueryTittleTotal, {tittleQuery: bindData.tittleQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}


const searchByInternAddress = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , address} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    addressQuery        : await bindsIn(`%${address.query}%`),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.InternqueryAddress, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.InternqueryAddressTotal, {addressQuery: bindData.addressQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}


const searchByInternlocation = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , location} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    locationQuery        : await bindsIn(`%${location.query}%`),
  }

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.InternqueryLocation, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.InternqueryLocationTotal, {locationQuery: bindData.locationQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}


const searchByInternSkill = async (req, res) => {

  // const {id, clientName} = req.body.refTokenData;
  const { Database, pagination, config , skill} = req.body;
  const { starts, totalRows } = pagination;
  const bindData =  {
    starts             : await bindsIn(parseInt(starts, 10)),
    totalRows          : await bindsIn(parseInt(totalRows, 10)),
    cloudinary_link    : await bindsIn(config.cloudinary.url),
    skillQuery         : await bindsIn(`%${skill.query}%`),
  } 

  return new Promise( ( resolve, reject) => {
    Database.executeQuery(SQL.InternqueryJobSkill, bindData)
      .then(async (result) => {
        Database.executeQuery(SQL.InternqueryJobSkillTotal, {skillQuery: bindData.skillQuery}).then( async (result2)=>{

          resolve(
            res.status(200).send({data: result.rows , total : parseInt(result2.rows[0].TOTAL, 10)})
          );

        }).catch(async(err)=>{
          resolve(
            res.status(400).send(
              { code: 1005, DatabaseMsg: err.message,
                 info: "Query for getting client basic info", 
                 Error: new Error("error while query execution") }
                 )
          );    
        })
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });

}



const AdminHome = async(req,res)=>{
  
  return new Promise( ( resolve, reject) => {
    
    const { Database } = req.body;
    const bindData =  {  };

    Database.executeQuery(SQL.AdminHome, bindData)
      .then(async (result) => {
        console.log([...result.rows]);
        resolve(
          res.status(200).send( [...result.rows] )
        );
        
      })
      .catch(async (err) => {
        resolve(
          res.status(400).send(
            { code: 1005, DatabaseMsg: err.message,
               info: "Query for getting client basic info", 
               Error: new Error("error while query execution") }
               )
        );
      });
  });
}

module.exports = { databaseInitialize, DBvalidation, 
  addUser, storeSession, deleteUserSession, deleteAllUserSession,
   findSession, updatePicture, basicInfo , updateBasicInfo , skillOption
    , stdSkill , updateSkill , stdExperience , addExperience, modifyExperience
     , removeExperience , getPicture, serviceOption , indServices , updateServices
      , orgInfo , updateOrgInfo , getStudent, MessageStore , getMessage, jobRequest , jobPost 
       , internsPost , searchByUniversity , searchByName , searchByYear, searchByDepart, searchBySkill
        , getSoftwareHouse , getJob, jobSkill , searchBycompanyName , searchBytittle ,  searchByAddress
         ,searchBylocation  , searchByJobSkill , searchByIndusCompanyName, searchByIndusAddress , searchByIndusService
          , getIntern , InternSkill, searchByInterncompanyName , searchByInterntittle , searchByInternAddress , searchByInternlocation 
           , searchByInternSkill , getStudentRequest , AdminHome};
