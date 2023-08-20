// used modules
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var validator = require('validator');
var cors = require('cors');
var logger = require('morgan');

/*      not used modules used these in future    */
// var createError = require('http-errors');
// var path = require('path');

/*     custom module        */
require('dotenv').config();
const { conf } = require('./lib/configuration');
const { Database } = require('./database/lib/DatabaseLayer');

/*     Routes        */
const login = require('./Routes/login');
const admin = require('./Routes/adminlogin');
const signUp = require('./Routes/signUp');
const logout = require('./Routes/logout');
const otp = require('./Routes/otp');
const profile = require('./Routes/profile');
const authenticate = require('./middleware/authentication');
const studentSearch = require('./Routes/student');
const softwareHouse = require('./Routes/softwareHouse');

const message = require('./Routes/message');
const rquest = require('./Routes/Rquest');
const job = require('./Routes/job');
const internship = require('./Routes/internship');
const Admin = require('./Routes/Admin');



//


let DB = new Database();

const config = conf();   // initial app configuration setting

// app.use(logger());

app.use(function (req, res, next) {
       res.header('Content-Type', 'application/json;charset=UTF-8')
       res.header('Access-Control-Allow-Credentials', true)
       res.header(
              'Access-Control-Allow-Headers',
              'Origin, X-Requested-With, Content-Type, Accept'
       )
       next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());


app.use(function (req, res, next) {
       // console.log(req.body)
       // console.log("line 56 , 59")
       next();
});

app.use(cors({
       credentials: true,
       origin: config.publicIp.ip,
       optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));


app.use('/api/login'
       , async function (req, res, next) {
              req.body.Database = DB;
              req.body.config = config;
              next();
       }
       , login
);
app.use('/api/login/admin'
       , async function (req, res, next) {
              req.body.Database = DB;
              req.body.config = config;
              next();
       }
       , admin
);


app.use('/api/signup'
       , async function (req, res, next) {
              console.log({ ...req.body });
              req.body.Database = DB;
              req.body.config = config;
              next();
       }
       , signUp
);


app.use('/api/logout'
       , async function (req, res, next) {
              req.body.Database = DB;
              req.body.config = config;
              next();
       }
       , authenticate

       , logout
);


app.use('/api/otp'
       , async function (req, res, next) {
              // req.body.Database = DB; 
              req.body.config = config;
              next();
       }
       , otp
);


app.use('/api/user/profile'
       , function (req, res, next) {
              // console.log(req.body)
              req.body.Database = DB;
              req.body.config = config;
              next();
              // res.status(200).send("ok")
       }
       , profile
);

app.use('/api/user/student'
       , function (req, res, next) {
              // console.log(req.body)
              req.body.Database = DB;
              req.body.config = config;
              next();
              // res.status(200).send("ok")
       }
       , studentSearch

);

app.use('/api/user/softwareHouse'
       , function (req, res, next) {
              // console.log(req.body)
              req.body.Database = DB;
              req.body.config = config;
              next();
              // res.status(200).send("ok")
       }
       , softwareHouse

);




app.use('/api/user/message'
       , function (req, res, next) {
              // console.log(req.body)
              req.body.Database = DB;
              req.body.config = config;
              next();
              // res.status(200).send("ok")
       }
       , message
);


app.use('/api/user/request'
       , function (req, res, next) {
              // console.log(req.body)
              req.body.Database = DB;
              req.body.config = config;
              next();
              // res.status(200).send("ok")
       }
       , rquest
);

app.use('/api/user/job'
       , function (req, res, next) {
              // console.log(req.body)
              req.body.Database = DB;
              req.body.config = config;
              next();
              // res.status(200).send("ok")
       }
       , job
);


app.use('/api/user/internship'
       , function (req, res, next) {
              // console.log(req.body)
              req.body.Database = DB;
              req.body.config = config;
              next();
              // res.status(200).send("ok")
       }
       , internship
);

       
app.use('/api/user/admin'
, function (req, res, next) {
       // console.log(req.body)
       req.body.Database = DB;
       req.body.config = config;
       next();
       // res.status(200).send("ok")
}
, Admin
);


// app.get('/',function(req,res){

//        // const cookie_data={
//        //        domain:'.iacs.site',
//        //        path:'/',
//        //        secure:false,
//        //        httpOnly:true,
//        //        sameSite:'Strict',
//        //        signed:false
//        //    }
//        // res.cookie('iacs', req.body.accToken, { ...cookie_data });
       
//        res.status(200).send({"zz":"sfddj"});
// });


const getfunction = require('./testing');

getfunction();


var port = process.env.PORT;
app.set('port', port);

app.listen(port, console.log(`Listening... ${port}`)); 