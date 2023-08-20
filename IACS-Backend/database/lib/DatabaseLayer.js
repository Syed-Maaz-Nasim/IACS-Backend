const {libPath, PDBcon, storedProcedures} = require('./DBcon');
const oracleOBJ = require('oracledb');
const fs = require('fs');
require('dotenv').config();


Database = class {

    oracledb = oracleOBJ;  
    
    constructor() {
        this.databaseInitialize();
    }

    connection = async () => {

        return await this.oracledb.getConnection(PDBcon.poolAlias)
        .catch((err)=>{ throw {err, Error:"Error in making connection" }})
        // .then((conn)=>{ oraclConnection = conn; console.log("connection created")})
        // return oraclConnection;
    }
  
    doRelease = async (connection)=>{
        await connection.close()    
        .then(()=>{
            // console.log("connection close")
        })
        .catch((err)=>{ throw new Error('error in closing Database connection'); }); 
    }
    
    executeQuery = async (SQLquery, bindData) => {
        let result;
        // console.log(bindData);
        const conn = await this.connection();
        await conn.execute(SQLquery,bindData)
            .then(  res => result = res )
            .then( async ()=>{await this.doRelease(conn);} )
            .catch(
               async (err)=>{ 
                await this.doRelease(conn);
                console.log(err);
                throw new Error('error in executing query'); 
            }); 
        return result;
    }
    
    databaseInitialize = async ()=>{

        if (libPath.path && fs.existsSync(libPath.path)) {
            oracleOBJ.initOracleClient({ libDir: libPath.path });
        }
        else {
            console.log( " Invalid Database Driver client path " + libPath.path);
            console.log( " Please read out comment in DBcon.js file for installation for driver" )
        } 
        
        //output of query will be in Object format
        this.oracledb.outFormat = this.oracledb.OUT_FORMAT_OBJECT;    
        await  this.oracledb.createPool( PDBcon )
                .then(()=>{
                    console.log("pool created")
                })
                .catch((err)=>{console.log(err);
        });
        
        // await oracledb.getConnection(PDBcon.poolAlias)
        await this.connection()
        .then( 
          async (conn)=>{
            // for initialization of storeProcedures
            conn.execute( storedProcedures.loginDataValidation );
            conn.execute( storedProcedures.addUser );
            conn.execute( storedProcedures.findSession );
            conn.execute( storedProcedures.addSession );
            conn.execute( storedProcedures.deleteSession );
            conn.execute( storedProcedures.deleteAllSessions );        
            conn.execute( storedProcedures.basicInfo );        
            conn.execute( storedProcedures.updateBasicInfo );
            conn.execute( storedProcedures.FIND_ACC_LINK );
            conn.execute( storedProcedures.ARR );
            conn.execute( storedProcedures.updateSkill );
            conn.execute( storedProcedures.addExperience );
            conn.execute( storedProcedures.modifyExperience );
            conn.execute( storedProcedures.updateServices );
            conn.execute( storedProcedures.orgInfo );
            conn.execute( storedProcedures.updateOrgInfo );
            conn.execute( storedProcedures.jobPost );
            conn.execute( storedProcedures.internsPost );
            conn.execute( storedProcedures.AdminHome_Views.INTERNSHIP_view );
            conn.execute( storedProcedures.AdminHome_Views.Jobs_view );
            conn.execute( storedProcedures.AdminHome_Views.industry_view );
            conn.execute( storedProcedures.AdminHome_Views.student_view );
            
            
            await this.doRelease(conn).catch(err=>console.log(err));  
        })
        .catch(err => console.log(err));
    }
}


let bindFormat = {

    direction : { 
        OUT      : oracleOBJ.BIND_OUT,
        IN       : oracleOBJ.BIND_IN,
    },
    type      : {
        String   : oracleOBJ.STRING,
        boolean  : oracleOBJ.DB_TYPE_BOOLEAN,
        Number   : oracleOBJ.NUMBER,
        Date     : oracleOBJ.DB_TYPE_DATE, 
        // Date     : oracleOBJ.DATE, 
    },
    size      : {
        maxSize  : (size) => { return  size; },
        forError   : (size) => { return  size; }
        
    }
};


let bindsOut = async (Direction, type, size = {types : 'forError' , value: 200}) =>{
    
    return { 
     dir: bindFormat.direction[Direction],
     type: bindFormat.type[type], 
     maxSize: bindFormat.size[size.types](size.value)
    }
}


let bindsIn = async (value , type = null ) =>{

    if (type!=null) {
        const Direction = 'IN';
        return {
            dir: bindFormat.direction[Direction],
            type: bindFormat.type[type],
            val: value
        }
    }else{
        return value;
    }
}
   


module.exports = {Database, bindsOut, bindsIn};