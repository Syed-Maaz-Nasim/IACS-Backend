
require('dotenv').config();

const DDBcon = { // for creating connection directly
    user: process.env.user,
    password : process.env.password,
    connectString: process.env.connectString
}
const PDBcon = { // for creating connection through connection pool
    user: process.env.user,
    password : process.env.password,
    connectString: process.env.connectString,
    poolTimeout : parseInt(process.env.poolTimeout,10), //connection releases, when not in use for certain duration
    queueTimeout: parseInt(process.env.poolTimeout,10),
    poolAlias : process.env.poolAlias                    //name of pool
};

//  link for install oracle client instant
//  https://www.oracle.com/database/technologies/instant-client/downloads.html
const libPath = {
    path: 'E:\\instantclient_19_12' 
}


const SQL={
      query1: "BEGIN LOGINDATAVALIDATION(:clientName, :email, :id ,:username , :passwordHash, :isDataFound); END;"
    , query2: "BEGIN addUser(:hrName, :cnic, :city, :country, :CGPA, :department, :university, :phoneNumber, :organizationName, :clientName, :email, :fname, :lname, :year, :semester, :passwordHash, :enrollment, :id, :isAlready); END;"
    , findSession: "BEGIN findSession( :id, :clientName, :iat, :exp, :isfound );END;"
    , deleteAllSessions: "BEGIN deleteAllSessions( :id, :clientName ); END;"
    , deleteSession: "BEGIN deleteSession( :id, :clientName, :iat ); END;"
    , addSession: "BEGIN addSession( :id, :clientName, :device, :iat, :exp, :isInserted ); END;"
    , basicInfo: "BEGIN basicInfo( :id, :clientName, :phoneNumber ,:enrollment, :department, :year, :semester, :CGPA, :DOB, :gender, :address, :github, :linkedin, :aboutUs, :fname, :lname, :email, :university ); END;"
    , updateBasicInfo: "BEGIN updateBasicInfo( :id, :clientName, :phoneNumber ,:enrollment, :department, :year, :semester, :CGPA, :DOB, :gender, :address, :github, :linkedin, :aboutUs, :fname, :lname, :email, :university , :isInserted); END;" 
    , skillOptons: "SELECT SKILLNAME FROM SKILL"
    , stdSkill :"SELECT SKILLNAME FROM (SELECT SKILLID FROM STDSKILL WHERE STDID = :id) INNER JOIN SKILL ON  SKILLID = SKILL.ID"
    , jobSkill :"SELECT SKILLNAME FROM (SELECT SKILLID FROM jobskill WHERE jobID = :id) INNER JOIN SKILL ON  SKILLID = SKILL.ID"
    , updateSkill: "BEGIN updateSkill( :id , :dSkill , :aSkill , :isUpdated ); END;"
    , stdExperience :"SELECT ID, JOBROLE, CNAME, startdate,enddate,descriptioN FROM experience WHERE STDID =  :id " 
    , addExperience: "BEGIN ADDEXPERIENCE( :id, :eid, :com, :job, :des, :SD, :ED, :isInserted); END;" 
    , modifyExperience: "BEGIN MODIFYEXPERIENCE( :id, :eid, :com, :job, :des, :SD, :ED, :isUpdated); END;" 
    , removeExperience:`BEGIN DELETE FROM EXPERIENCE where EXPERIENCE.ID = :eid AND EXPERIENCE.STDID = :id;  IF sql%found THEN 
       :isDELETED := true;
    ELSIF sql%notfound THEN 
       :isDELETED := false;
     END IF;
      COMMIT; END;`
    , updatePicture:`BEGIN 
    IF :clientName = 'student' THEN
        UPDATE STUDENT SET PIC = :url WHERE ID = :uid;
    ELSE
        UPDATE INDUSTRIES SET LOGO = :url WHERE ID = :uid;
    END IF;
    IF sql%found THEN 
        :isInserted := true;
    ELSIF sql%notfound THEN 
        :isInserted := false;
    END IF;
        COMMIT; 
        END;`
    , getPicture: `BEGIN 
    IF :clientName = 'student' THEN
        select PIC INTO :url from student WHERE ID = :uid;
    ELSE
        select LOGO INTO :url from INDUSTRIES WHERE ID = :uid;
    END IF;

        END;`
    , serviceOption : "SELECT SERVICENAME FROM SERVICES"
    , indServices : "SELECT SERVICENAME FROM (SELECT SERID FROM INDSERVICE WHERE INDID = :id) INNER JOIN SERVICES ON  SERID = SERVICES.ID"
    , updateServices : "BEGIN updateServices( :id , :dService , :aService , :isUpdated ); END;"
    , orgInfo: "BEGIN orgInfo( :id , :clientName, :phoneNumber , :address , :linkedin , :aboutUs , :hrName , :website , :orgName ); END;"
    , updateOrgInfo: "BEGIN updateOrgInfo( :id , :phoneNumber , :address , :linkedin , :aboutUs , :hrName , :website , :isInserted ); END;" 





    
    , InterngetJob: `select  internship.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE 
    from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id where internship.rowid in 
    ( select internship.rowid rid from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id 
        order by internship.ID desc  offset :starts rows fetch next :totalRows rows only) order by internship.ID desc
    `
    , InterngetTotalJob: `select count(*) total from internship  INNER JOIN INDUSTRIES ON internship.indid = industries.id`
    
    , InternjobSkill :"SELECT SKILLNAME FROM (SELECT SKILLID FROM INTERNS_SKILL WHERE INTID = :id) INNER JOIN SKILL ON  SKILLID = SKILL.ID"
    , InternqueryCompanyName: 
    `select  internship.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE
    from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id where internship.rowid in 
     (select internship.rowid rid from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id 
         where lower( industries.orgname) LIKE lower(:companyNameQuery) 
    order by internship.ID desc offset :starts rows fetch next :totalRows rows only)`
    , InternqueryCompanyNameTotal: `select count(*) total from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id 
    where lower( industries.orgname) LIKE lower(:companyNameQuery) `
    , InternqueryTittle: `select  internship.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE
    from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id where internship.rowid in 
     (select internship.rowid rid from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id 
         where lower( TITTLE) LIKE lower(:tittleQuery) 
    order by internship.ID desc offset :starts rows fetch next :totalRows rows only)`
    , InternqueryTittleTotal: `select count(*) total from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id 
    where lower( TITTLE) LIKE lower(:tittleQuery) `
    , InternqueryAddress: `select  internship.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE
    from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id where internship.rowid in 
     (select internship.rowid rid from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id 
         where lower(industries.address) LIKE lower(:addressQuery) 
    order by internship.ID desc offset :starts rows fetch next :totalRows rows only)`
    , InternqueryAddressTotal: `select count(*) total from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id 
    where lower( industries.address) LIKE lower(:addressQuery) `
    
    , InternqueryLocation: `select  internship.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE
    from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id where internship.rowid in 
     (select internship.rowid rid from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id 
         where lower(LOCATION) LIKE lower(:locationQuery) 
    order by internship.ID desc offset :starts rows fetch next :totalRows rows only)`
    , InternqueryLocationTotal: `select count(*) total from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id 
    where lower( LOCATION) LIKE lower(:locationQuery) `
    , InternqueryJobSkill:`select  internship.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE
    from internship INNER JOIN INDUSTRIES ON internship.indid = industries.id where internship.id in (
    select  DISTINCT internship.id
    from internship inner join INTERNS_SKILL on internship.id=INTERNS_SKILL.INTID inner join skill  on INTERNS_SKILL.skillid = skill.id 
    where lower(skill.skillname) like lower(:skillQuery)
    order by internship.ID desc
    offset :starts rows fetch next :totalRows rows only)` 
    , InternqueryJobSkillTotal:`
    select  count(DISTINCT internship.id) total
    from internship inner join INTERNS_SKILL on internship.id=INTERNS_SKILL.INTID inner join skill  on  INTERNS_SKILL.skillid = skill.id  
    where lower(skill.skillname) like lower(:skillQuery)`
    
    










    , getSoftwareHouse:`select ID, ORGNAME name, ADDRESS, BIO about, :cloudinary_link||LOGO image, WEBURL from INDUSTRIES where INDUSTRIES.rowid 
    in ( select INDUSTRIES.rowid rid from INDUSTRIES order by ID desc offset :starts rows fetch next :totalRows rows only)`
    , getTotalSoftwareHouse: `select count(*) total from INDUSTRIES`

    , queryIndusCompanyName: `select ID, ORGNAME name, ADDRESS, BIO about, :cloudinary_link||LOGO image, WEBURL from INDUSTRIES
    where INDUSTRIES.rowid in ( select INDUSTRIES.rowid rid from INDUSTRIES where lower(INDUSTRIES.ORGNAME) LIKE lower(:companyNameQuery) 
    order by ID desc offset :starts rows fetch next :totalRows rows only)`
    , queryIndusCompanyNameTotal: `select count(*) total from INDUSTRIES  where lower(INDUSTRIES.ORGNAME) LIKE lower(:companyNameQuery)  `

    , queryIndusAddress: `select ID, ORGNAME name, ADDRESS, BIO about, :cloudinary_link||LOGO image, WEBURL from INDUSTRIES
    where INDUSTRIES.rowid in ( select INDUSTRIES.rowid rid from INDUSTRIES where lower(ADDRESS) LIKE lower(:addressQuery) 
    order by ID desc offset :starts rows fetch next :totalRows rows only)`
    , queryIndusAddressTotal: `select count(*) total from INDUSTRIES  where lower(ADDRESS) LIKE lower(:addressQuery)  `
    , queryIndusServices:`select ID, ORGNAME name, ADDRESS, BIO about, :cloudinary_link||LOGO image, WEBURL from INDUSTRIES
    where  INDUSTRIES.id in (
    select  DISTINCT INDUSTRIES.id
    from INDUSTRIES inner join INDSERVICE on INDUSTRIES.id=INDSERVICE.INDID inner join SERVICES  on INDSERVICE.SERID = SERVICES.id 
    where lower(SERVICES.SERVICENAME) like lower(:servicesQuery)
    order by INDUSTRIES.ID desc
    offset :starts rows fetch next :totalRows rows only)` 
    , queryIndusServicesTotal:`
    select  count(DISTINCT INDUSTRIES.id) total
    from INDUSTRIES inner join INDSERVICE on INDUSTRIES.id=INDSERVICE.INDID inner join SERVICES  on INDSERVICE.SERID = SERVICES.id 
    where lower(SERVICES.SERVICENAME) like lower(:servicesQuery)`  
  




    , getJob: `select  Jobs.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE 
    from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id where JOBS.rowid in 
    ( select JOBS.rowid rid from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id 
        order by jobs.ID desc  offset :starts rows fetch next :totalRows rows only) order by ID desc
    `
    , getTotalJob: `select count(*) total from JOBS  INNER JOIN INDUSTRIES ON jobs.indid = industries.id`

    , queryCompanyName: `select  Jobs.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE
    from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id where JOBS.rowid in 
     (select JOBS.rowid rid from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id 
         where lower( industries.orgname) LIKE lower(:companyNameQuery) 
    order by jobs.ID desc offset :starts rows fetch next :totalRows rows only)`
    , queryCompanyNameTotal: `select count(*) total from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id 
    where lower( industries.orgname) LIKE lower(:companyNameQuery) `
    , queryTittle: `select  Jobs.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE
    from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id where JOBS.rowid in 
     (select JOBS.rowid rid from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id 
         where lower( TITTLE) LIKE lower(:tittleQuery) 
    order by jobs.ID desc offset :starts rows fetch next :totalRows rows only)`
    , queryTittleTotal: `select count(*) total from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id 
    where lower( TITTLE) LIKE lower(:tittleQuery) `
    , queryAddress: `select  Jobs.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE
    from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id where JOBS.rowid in 
     (select JOBS.rowid rid from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id 
         where lower(industries.address) LIKE lower(:addressQuery) 
    order by jobs.ID desc offset :starts rows fetch next :totalRows rows only)`
    , queryAddressTotal: `select count(*) total from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id 
    where lower( industries.address) LIKE lower(:addressQuery) `
    
    
    , queryLocation: `select  Jobs.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE
    from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id where JOBS.rowid in 
     (select JOBS.rowid rid from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id 
         where lower(LOCATION) LIKE lower(:locationQuery) 
    order by jobs.ID desc offset :starts rows fetch next :totalRows rows only)`
    , queryLocationTotal: `select count(*) total from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id 
    where lower( LOCATION) LIKE lower(:locationQuery) `
   


    , queryJobSkill:`select  Jobs.ID ,TITTLE ,LOCATION , DURATION , DESCRIPTION, LINKS , POSTDATE , industries.orgname COMPANYNAME, industries.address ADDRESS, :cloudinary_link||industries.logo IMAGE
    from JOBS INNER JOIN INDUSTRIES ON jobs.indid = industries.id where JOBS.id in (
    select  DISTINCT JOBS.id
    from jobs inner join jobskill on jobs.id=jobskill.jobid inner join skill  on jobskill.skillid = skill.id 
    where lower(skill.skillname) like lower(:skillQuery)
    order by jobs.ID desc
    offset :starts rows fetch next :totalRows rows only)` 
    , queryJobSkillTotal:`
    select  count(DISTINCT jobs.id) total
    from jobs inner join jobskill on jobs.id=jobskill.jobid inner join skill  on  jobskill.skillid = skill.id  
    where lower(skill.skillname) like lower(:skillQuery)`
    
    
    
    , getStudent: `select id,fname,lname,department,year,university,:cloudinary_link||pic image, bio aboutus from STUDENT where STUDENT.rowid in ( select STUDENT.rowid rid from STUDENT order by ID desc offset :starts rows fetch next :totalRows rows only) order by ID desc`
    , getTotalStudent: `select count(*) total from STUDENT`
    , queryUniversity: `select id,fname,lname,department,year,university,:cloudinary_link||pic image, bio aboutus from STUDENT 
    where STUDENT.rowid in ( select STUDENT.rowid rid from STUDENT where lower(university) LIKE lower(:universityQuery) 
    order by ID desc offset :starts rows fetch next :totalRows rows only)`
    , queryUniversityTotal: `select count(*) total from STUDENT where lower(university) LIKE lower(:universityQuery)`
    , queryName: `select id,fname,lname,department,year,university,:cloudinary_link||pic image, bio aboutus from STUDENT 
    where STUDENT.rowid in ( select STUDENT.rowid rid from STUDENT  where lower(fname||' '||lname) LIKE lower(:nameQuery) 
    order by ID desc offset :starts rows fetch next :totalRows rows only)`
    , queryNameTotal: `select count(*) total from STUDENT  where lower(fname||' '||lname) LIKE lower(:nameQuery) `
    , queryYear: `select id,fname,lname,department,year,university,:cloudinary_link||pic image, bio aboutus from STUDENT 
    where STUDENT.rowid in ( select STUDENT.rowid rid from STUDENT  where year like :yearQuery 
    order by ID desc offset :starts rows fetch next :totalRows rows only)`
    , queryYearTotal: `select count(*) total from STUDENT where year like :yearQuery `
    , queryDepart: `select id,fname,lname,department,year,university,:cloudinary_link||pic image, bio aboutus from STUDENT 
    where STUDENT.rowid in ( select STUDENT.rowid rid from STUDENT  where lower(department) like lower(:departQuery) 
    order by ID desc offset :starts rows fetch next :totalRows rows only)`
    , queryDepartTotal: `select count(*) total from STUDENT where lower(department) like lower(:departQuery)`
    , querySkill:`select id,fname,lname,department,year,university,:cloudinary_link||pic image, bio aboutus from STUDENT
    where  STUDENT.id in (
    select  DISTINCT STUDENT.id
    from student inner join stdskill on student.id=stdskill.stdid inner join skill  on stdskill.skillid = skill.id 
    where lower(skill.skillname) like lower(:skillQuery)
    order by student.ID desc
    offset :starts rows fetch next :totalRows rows only)` 
    , querySkillTotal:`
    select  count(DISTINCT STUDENT.id) total
    from student inner join stdskill on student.id=stdskill.stdid inner join skill  on stdskill.skillid = skill.id 
    where lower(skill.skillname) like lower(:skillQuery)`  
   
   
    , MessageStore: "begin insert into message ( MES_DATE, EMAIL, FULL_NAME, MESSAGE ) values ( :currentDate , :email  , :fullName  , :messageData   ); COMMIT; :isInserted := true; END;"
    

    , getMessage: `select *
    from message WHERE message.rowid in 
    ( select message.rowid rid from message offset :starts rows fetch next :totalRows rows only) order by message.MES_DATE  DESC
    `
    , getMessageTotal: `select count(*) total from message`

    , getStudentRequest: `select TYPE REQ_TYPE ,  TITTLE , LOCATION, DURATION , DESCRIPTION, REQUESTDATE, STUDENT.FNAME||''||STUDENT.LNAME NAME, ENROLLMENT, DEPARTMENT, UNIVERSITY, YEAR, :cloudinary_link||pic image 
    from REQUESTS INNER JOIN STUDENT ON REQUESTS.STDID = STUDENT.ID  WHERE REQUESTS.rowid in 
    ( select REQUESTS.rowid rid from REQUESTS INNER JOIN STUDENT ON REQUESTS.STDID = STUDENT.ID offset :starts rows fetch next :totalRows rows only) order by REQUESTS.REQUESTDATE DESC  
    `
    , getStudentRequestTotal: `select count(*) total from REQUESTS`

    , jobRequest: `BEGIN INSERT INTO REQUESTS (  STDID   , TYPE   , TITTLE , DURATION , LOCATION , DESCRIPTION  , REQUESTDATE )  VALUES ( :id , :type , :tittle , :duration , :location , :description , :RDATE ); commit;  :isInserted := true; END; `
    , jobPost: "BEGIN  jobPost( :id , :tittle  , :duration , :location , :skill , :linkedin  , :description , :PDATE  , :isInserted ); END;"
    , internsPost: "BEGIN  internsPost( :id , :tittle  , :duration , :location , :skill , :linkedin  , :description , :PDATE  , :isInserted ); END;"
    , AdminHome: `select FIRSTYEAR,secondyear,thirdyear,finalyear,student, softwarehouse, internship, JOBS
    FROM student_view 
    INNER join industry_view on student_view.id = industry_view.id 
    INNER join internship_view on internship_view.id = industry_view.id 
    inner join Jobs_view on Jobs_view.id=industry_view.id`
};      

const storedProcedures ={
    loginDataValidation :  `create or replace NONEDITIONABLE PROCEDURE loginDataValidation(
        clientName IN varchar2,
        isemail IN varchar2,
        userId OUT DECIMAL,
        userName OUT varchar2,
        passwordHash OUT varchar2,
        DFound OUT BOOLEAN
        )
    IS
    LastNAME VARCHAR2(10);
    FirstNAME VARCHAR2(10);
    
    BEGIN
    
    IF clientName = 'student' THEN
    
    Select ID, FNAME, LNAME, PASSWORD INTO  userId, FirstNAME, LastNAME, passwordHash from STUDENT where email = isemail; 
    userName := FirstNAME||' '||LastNAME;
    DFound := TRUE;
    
    ELSE  
    
    Select ID, orgname, PASSWORD INTO  userId, userName, passwordHash from INDUSTRIES where email = isemail; 
    DFound := TRUE;
    
    END IF;
    
    
    EXCEPTION
    WHEN no_data_found THEN
    DFound := FALSE;
    END loginDataValidation;` ,
    addUser :  
    `create or replace NONEDITIONABLE PROCEDURE addUser(
        userHrName       IN varchar2,
        userCnic         IN varchar2,
        userCity         IN varchar2,
        userCountry      IN varchar2,
        userCGPA         IN varchar2,
        userDepartment   IN varchar2,
        userUniversity   IN varchar2,
        userPhoneNumber  IN varchar2,
        organizationName IN varchar2,
        clientName       IN varchar2, 
        userEmail        IN varchar2,
        userFname        IN varchar2,
        userLname        IN varchar2,
        userYear         IN varchar2,
        userSemester     IN varchar2,
        userPassword     IN varchar2,
        userEnroll       IN varchar2,
        userID           OUT DECIMAL,
        isAlready        OUT BOOLEAN
        )
    IS
        I DECIMAL(15,0);
        uN varchar2(20);
        pH varchar2(73);
        DFound BOOLEAN;
    BEGIN
        LOGINDATAVALIDATION(clientName, userEmail, I, uN, pH, DFound);
        IF DFound THEN 
         isAlready := DFound ;  
        ELSE  
            IF clientName = 'student' THEN 
                 userID :=  STUDENT_SEQ.nextval;
                 insert INTO STUDENT (ID, CGPA, department, university , phoneNumber, PASSWORD, FNAME, LNAME, YEAR, SEMESTER, EMAIL, ENROLLMENT) VALUES(userID, userCGPA, userDepartment ,userUniversity, userPhoneNumber, userPassword , userFname, userLname, userYear, userSemester,  userEmail, userEnroll);
                 COMMIT;
            ELSE  
                 userID :=  INDUSTRY_SEQ.nextval;
                 insert INTO INDUSTRIES (ID, HRNAME, CNIC_NTN, CITY, COUNTRY, PASSWORD, ORGNAME, EMAIL) VALUES(userID, userHrName, userCnic, userCity, userCountry, userPassword , organizationName, userEmail);
                 COMMIT;
            END IF;    
        END IF;    
    END addUser;`,
    findSession: `create or replace PROCEDURE findSession(
        UID IN DECIMAL,
        clName IN varchar2,
        issDate IN DECIMAL,
        expDate IN DECIMAL,
        isfound OUT BOOLEAN
        )
    IS
    I DECIMAL(15,0);
    BEGIN
    
    Select USERID INTO I from TOKENTBL where USERID = UID AND ISSUEDATE = issDate AND CLIENTNAME = clName AND expiredate <= expDate; 
    isfound := TRUE;
    
    EXCEPTION
    WHEN no_data_found THEN
    isfound := FALSE;
        
    END findSession;`,
    addSession: `create or replace PROCEDURE addSession(
        UID IN DECIMAL,
        clName IN varchar2,
        Dev IN varchar2,
        issDate IN DECIMAL,
        expDate IN DECIMAL,
        isInserted OUT BOOLEAN
        )
    IS
    BEGIN
    
    INSERT INTO TOKENTBL (USERID,CLIENTNAME,ISSUEDATE,EXPIREDATE,DEVICE) VALUES (UID, clName, issDate, expDate, Dev );
    commit;
    isInserted:=true; 
    
    EXCEPTION
    WHEN others THEN
    isInserted:= false; 
    
    END addSession;`,
    deleteSession: `create or replace PROCEDURE deleteSession(
        UID IN DECIMAL,
        clName IN varchar2,
        issDate IN DECIMAL
        )
    IS
    BEGIN
      
    DELETE FROM TOKENTBL where USERID = UID AND ISSUEDATE = issDate AND CLIENTNAME = clName;
    commit;
        
    END deleteSession;`,
    basicInfo: `create or replace NONEDITIONABLE PROCEDURE BASICINFO(
        Uid             IN DECIMAL,
        clientName     IN varchar2, 
        phoneNumber    OUT varchar2, 
        enrollment     OUT varchar2,
        department     OUT varchar2,
        year           OUT varchar2,
        semester       OUT varchar2,
        CGPA           OUT varchar2,
        DOB            OUT DATE    ,
        gender         OUT varchar2,
        address        OUT varchar2,
        github         OUT varchar2,
        linkedin       OUT varchar2,
        aboutUs        OUT varchar2,
        fname          OUT varchar2,
        lname          OUT varchar2,
        email          OUT varchar2,
        university     OUT varchar2
 )
        
    IS
    BEGIN
    

    Select FNAME, LNAME, EMAIL, ENROLLMENT, CGPA,  DEPARTMENT,  UNIVERSITY,  PHONENUMBER,  YEAR,  SEMESTER,  DOB,  ADDRESS, GENDER ,  BIO  
    INTO  fname, lname, email, enrollment,  CGPA, department, university,  phoneNumber, year , semester, DOB, address, gender, aboutUs  from STUDENT 
    where ID = Uid;
    github   := FIND_ACC_LINK(Uid,clientName,'github');
    linkedin := FIND_ACC_LINK(Uid,clientName,'linkedin');

    EXCEPTION
    WHEN others THEN
        phoneNumber := '' ; 
        enrollment  := '' ; 
        department  := '' ; 
        year        := '' ; 
        semester    := '' ; 
        CGPA        := '' ; 
        DOB         := '' ; 
        gender      := '' ; 
        address     := '' ; 
        github      := '' ; 
        linkedin    := '' ; 
        aboutUs     := '' ; 
        fname       := '' ; 
        lname       := '' ; 
        email       := '' ; 
        university  := '' ; 

    END BASICINFO;`,
    deleteAllSessions : `create or replace PROCEDURE deleteAllSessions(
        UID IN DECIMAL,
        clName IN varchar2
        )
    IS
    BEGIN
      
    DELETE FROM TOKENTBL where USERID = UID AND CLIENTNAME = clName;
    commit;
        
    END deleteAllSessions;`,   
    updateBasicInfo: `
    create or replace NONEDITIONABLE PROCEDURE UPDATEBASICINFO(
        Uid            IN DECIMAL ,
        clientNam      IN varchar2,
        mobileNumber   IN varchar2, 
        enrlment       IN varchar2,
        depart         IN varchar2,
        yr             IN varchar2,
        smster         IN varchar2,
        GPA            IN varchar2,
        birthday       IN varchar2,
        gndr           IN varchar2,
        addr           IN varchar2,
        githubLink     IN varchar2,
        linkedinLink   IN varchar2,
        aboutUs        IN varchar2,
        firstName      IN varchar2,
        lastName       IN varchar2,
        emailAddr      IN varchar2,
        uni            IN varchar2,
        isInserted     OUT BOOLEAN
    )
        
    IS
     COUNT_ACC NUMBER;
     GITHUB_ACC NUMBER;
     LINKEDIN_ACC NUMBER;
     
    BEGIN
    
    IF clientNam  = 'student' THEN   
    
    UPDATE STUDENT
    SET FNAME = firstName, LNAME= lastName, EMAIL =emailAddr, ENROLLMENT = enrlment  , CGPA = GPA  ,  DEPARTMENT = depart     ,  UNIVERSITY = uni,
    PHONENUMBER = mobileNumber ,  YEAR = yr  ,  SEMESTER=smster, DOB =  TO_DATE(birthday, 'DD/MM/YYYY'),  ADDRESS = addr, GENDER = gndr ,  BIO = aboutUs
    where ID = Uid;
    
    SELECT COUNT(STDID) INTO COUNT_ACC FROM STDSOCIALACCOUNT WHERE STDID=Uid;

    SELECT ID INTO GITHUB_ACC   FROM socialmedia WHERE MEDIANAME='github';    
    SELECT ID INTO LINKEDIN_ACC FROM socialmedia WHERE MEDIANAME='linkedin';    
    
    IF COUNT_ACC != 0 THEN    
       UPDATE STDSOCIALACCOUNT set LINK=githubLink   WHERE STDID=Uid AND SMID=GITHUB_ACC;
       UPDATE STDSOCIALACCOUNT set LINK=linkedinLink WHERE STDID=Uid AND SMID=LINKEDIN_ACC;
    ELSE
      INSERT INTO STDSOCIALACCOUNT VALUES(Uid,GITHUB_ACC, githubLink);
      INSERT INTO STDSOCIALACCOUNT VALUES(Uid,LINKEDIN_ACC, linkedinLink);  
    END IF;

    IF sql%found THEN 
        isinserted := true;
    ELSIF sql%notfound THEN 
        isinserted := false;
    END IF; 
    COMMIT;
    
    ELSE  
    
    UPDATE STUDENT
    SET FNAME = firstName, LNAME= lastName, EMAIL =emailAddr, ENROLLMENT = enrlment  , CGPA = GPA  ,  DEPARTMENT = depart,  UNIVERSITY = uni,
    PHONENUMBER = mobileNumber ,  YEAR = yr  ,  SEMESTER=smster, DOB =  birthday,  ADDRESS = addr, GENDER = gndr ,  BIO = aboutUs
    where ID = Uid;
    COMMIT;
    isinserted := true;
    
    END IF;
    END UPDATEBASICINFO;
    `,
    FIND_ACC_LINK:`
    CREATE OR REPLACE FUNCTION FIND_ACC_LINK(UID IN number, clientName IN VARCHAR2, MEDIA IN VARCHAR2)
    RETURN VARCHAR2 IS 
       LINKS VARCHAR2(200) := '';
    BEGIN 

    IF clientName = 'student' THEN
        SELECT LINK INTO LINKS
            FROM (SELECT STDID,SMID,LINK FROM STDSOCIALACCOUNT WHERE STDSOCIALACCOUNT.STDID = UID )
            INNER JOIN SOCIALMEDIA ON SMID=SOCIALMEDIA.ID
            WHERE socialmedia.medianame = MEDIA;
    ELSE  
        SELECT LINK INTO LINKS
            FROM (SELECT INDID, SMID, LINK FROM INDSOCIALACCOUNT WHERE INDSOCIALACCOUNT.INDID = UID )
            INNER JOIN SOCIALMEDIA ON SMID=SOCIALMEDIA.ID
            WHERE socialmedia.medianame = MEDIA ;
    END IF;
       
    RETURN LINKS; 
   
    EXCEPTION
       WHEN others THEN
        RETURN LINKS; 

    END;`,
    ARR:`create or replace NONEDITIONABLE TYPE ARR AS VARRAY(150) OF varchar2(50);`,//for skill input to database
    updateSkill: `CREATE OR REPLACE NONEDITIONABLE PROCEDURE updateSkill(
        UID           IN DECIMAL,
        DELETED_SKILL IN  ARR,
        ADDED_SKILL   IN  ARR,
        isUPDATED     OUT BOOLEAN

)
IS 
INSERTION BOOLEAN;
UPDATION BOOLEAN;
BEGIN

FORALL i IN INDICES OF ADDED_SKILL
  INSERT INTO stdskill (STDID, SKILLID) VALUES (UID,(SELECT SKILL.ID FROM SKILL WHERE SKILL.SKILLNAME = ADDED_SKILL(i)) );
 
  IF sql%found THEN 
    INSERTION := true;
ELSIF sql%notfound THEN 
    INSERTION := false;
END IF; 

FORALL J IN INDICES OF DELETED_SKILL
  DELETE FROM STDSKILL WHERE STDSKILL.stdid = UID AND STDSKILL.SKILLID = (SELECT SKILL.ID FROM SKILL WHERE SKILL.SKILLNAME = DELETED_SKILL(J)) ;

IF sql%found THEN 
    UPDATION := true;
ELSIF sql%notfound THEN 
    UPDATION := false;
END IF; 

IF (INSERTION = true OR  UPDATION = true) THEN 
isUPDATED := true;
ELSE 
isUPDATED := false;
END IF; 


COMMIT;

EXCEPTION 
WHEN others THEN 
    isUPDATED := false;
 
    END updateSkill;`,
    addExperience: `
    create or replace NONEDITIONABLE PROCEDURE ADDEXPERIENCE(
        UID           IN DECIMAL   ,                   
        eid           IN DECIMAL   ,                   
        companyName   IN varchar2  ,                       
        job           IN varchar2  ,                   
        Descr         IN varchar2  ,
        startDate     IN varchar2  ,                       
        endDate       IN varchar2  ,                   
        isInserted    OUT BOOLEAN
    )
        
    IS
    BEGIN
    
      INSERT INTO EXPERIENCE (ID, CNAME, STARTDATE, ENDDATE, JOBROLE ,DESCRIPTION, STDID) VALUES(eid ,companyName, TO_DATE(startDate, 'DD/MM/YYYY'),TO_DATE(endDate, 'DD/MM/YYYY') ,job ,Descr ,UID);

      IF sql%found THEN 
        isInserted := true;
      ELSIF sql%notfound THEN 
        isInserted := false;
      END IF; 
      COMMIT;
      
    
      EXCEPTION
          WHEN others THEN 
          isInserted := false;
      
      END ADDEXPERIENCE;
      `,
    modifyExperience: `
    create or replace NONEDITIONABLE PROCEDURE MODIFYEXPERIENCE(
        UID           IN DECIMAL   ,                   
        eid           IN DECIMAL   ,                   
        companyName   IN varchar2  ,                       
        job           IN varchar2  ,                   
        Descr         IN varchar2  ,
        sDate         IN varchar2  ,                       
        EDate         IN varchar2  ,                   
        isUpdated     OUT BOOLEAN
    )
        
    IS
    BEGIN
    
      UPDATE EXPERIENCE
      SET  CNAME= companyName, STARTDATE =TO_DATE(sDate, 'DD/MM/YYYY'), ENDDATE = TO_DATE(EDate, 'DD/MM/YYYY')  , JOBROLE = job,  DESCRIPTION = Descr
      where ID = eid AND STDID = UID;

      
      IF sql%found THEN 
        isUpdated := true;
      ELSIF sql%notfound THEN 
       isUpdated := false;
      END IF; 
      
      COMMIT;

      EXCEPTION
        WHEN others THEN 
         isUpdated := false;
      END MODIFYEXPERIENCE;
      `,
    updateServices: `CREATE OR REPLACE NONEDITIONABLE PROCEDURE updateServices(
        UID                 IN DECIMAL,
        DELETED_SERVICE     IN  ARR,
        ADDED_SERVICE        IN  ARR,
        isUPDATED            OUT BOOLEAN

)
IS 
INSERTION BOOLEAN;
UPDATION BOOLEAN;
BEGIN

FORALL i IN INDICES OF ADDED_SERVICE
  INSERT INTO INDSERVICE (INDID, SERID) VALUES (UID,(SELECT SERVICES.ID FROM SERVICES WHERE SERVICES.SERVICENAME = ADDED_SERVICE(i)) );
 
  IF sql%found THEN 
    INSERTION := true;
ELSIF sql%notfound THEN 
    INSERTION := false;
END IF; 

FORALL J IN INDICES OF DELETED_SERVICE
  DELETE FROM INDSERVICE WHERE INDSERVICE.INDID = UID AND INDSERVICE.SERID = (SELECT SERVICES.ID FROM SERVICES WHERE SERVICES.SERVICENAME = DELETED_SERVICE(J)) ;

IF sql%found THEN 
    UPDATION := true;
ELSIF sql%notfound THEN 
    UPDATION := false;
END IF; 

IF (INSERTION = true OR  UPDATION = true) THEN 
isUPDATED := true;
ELSE 
isUPDATED := false;
END IF; 


COMMIT;

EXCEPTION 
WHEN others THEN 
    isUPDATED := false;
 
    END updateServices;`,
    orgInfo: `create or replace NONEDITIONABLE PROCEDURE orgInfo(
        Uid            IN  DECIMAL,
        clientName     IN  varchar2,
        pNumber        OUT varchar2, 
        adrss          OUT varchar2,
        linkedin       OUT varchar2,
        aboutUs        OUT varchar2,
        hrNam          OUT varchar2,
        webist         OUT varchar2,
        orgNam         OUT varchar2
        )
        
    IS
    BEGIN
    
    Select PHONENUMBER, ADDRESS, BIO, HRNAME, WEBURL,  ORGNAME INTO  pNumber , adrss, aboutUs, hrNam,  webist, orgNam from INDUSTRIES 
    where ID = Uid;
    linkedin := FIND_ACC_LINK(Uid,clientName,'linkedin');

    END orgInfo;`,
    updateOrgInfo: `
    create or replace NONEDITIONABLE PROCEDURE updateOrgInfo(
        Uid            IN DECIMAL ,
        mobileNumber   IN varchar2, 
        adrss          IN varchar2,
        linkedinLink   IN varchar2,
        aboutUs        IN varchar2,
        hrNam          IN varchar2,
        webist         IN varchar2,
        isInserted     OUT BOOLEAN
    )
        
    IS
     COUNT_ACC NUMBER;
     LINKEDIN_ACC NUMBER;
    BEGIN
    
    
    UPDATE INDUSTRIES
    SET PHONENUMBER = mobileNumber , ADDRESS = adrss ,  BIO = aboutUs, HRNAME = hrNam , WEBURL = webist
    where ID = Uid;
    
    SELECT COUNT(INDID) INTO COUNT_ACC FROM INDSOCIALACCOUNT WHERE INDID=Uid;
    SELECT ID INTO LINKEDIN_ACC FROM socialmedia WHERE MEDIANAME='linkedin';    
    
    IF COUNT_ACC != 0 THEN    
       UPDATE INDSOCIALACCOUNT set LINK=linkedinLink WHERE INDID=Uid AND SMID=LINKEDIN_ACC;
    ELSE
      INSERT INTO INDSOCIALACCOUNT VALUES(Uid,LINKEDIN_ACC, linkedinLink);  
    END IF;

    IF sql%found THEN 
        isInserted := true;
    ELSIF sql%notfound THEN 
        isInserted := false;
    END IF; 
    COMMIT;

    END updateOrgInfo;
    `,
    jobPost: `CREATE OR REPLACE NONEDITIONABLE PROCEDURE jobPost(
        UID             IN DECIMAL,
        title           IN VARCHAR2,
        durtion         IN VARCHAR2,
        loC             IN VARCHAR2,
        skill           IN ARR,
        linkin          IN VARCHAR2,
        descrip         IN VARCHAR2,
        PDATE           IN TIMESTAMP,
        isInserted      OUT BOOLEAN

)
IS 
BEGIN
    
INSERT INTO JOBS ( ID  , INDID , TITTLE   , LOCATION   , DURATION   , DESCRIPTION    , LINKS   , POSTDATE    ) VALUES (JOB_SEQ.nextval, UID, title, loC, durtion ,descrip,  linkin, PDATE   );

FORALL i IN INDICES OF skill
  INSERT INTO JOBSKILL (JOBID, SKILLID) VALUES ( JOB_SEQ.CURRVAL,(SELECT SKILL.ID FROM SKILL WHERE SKILL.SKILLNAME = skill(i)) );

IF sql%found THEN 
    isInserted := true;
ELSIF sql%notfound THEN 
    isInserted := false;
END IF; 
COMMIT;

EXCEPTION 
WHEN others THEN 
    isInserted := false;
 
END jobPost;`,
    internsPost: `CREATE OR REPLACE NONEDITIONABLE PROCEDURE internsPost(
    UID             IN DECIMAL,
    title           IN VARCHAR2,
    durtion         IN VARCHAR2,
    loC             IN VARCHAR2,
    skill           IN ARR,
    linkin          IN VARCHAR2,
    descrip         IN VARCHAR2,
    PDATE           IN TIMESTAMP,
    isInserted      OUT BOOLEAN

)
IS 
BEGIN

INSERT INTO INTERNSHIP ( ID  , INDID , TITTLE   , LOCATION   , DURATION   , DESCRIPTION    , LINKS   , POSTDATE    ) VALUES (INTERNS_SEQ.nextval, UID, title, loC, durtion ,descrip,  linkin, PDATE   );

FORALL i IN INDICES OF skill
    INSERT INTO INTERNS_SKILL (INTID, SKILLID) VALUES ( INTERNS_SEQ.CURRVAL,(SELECT SKILL.ID FROM SKILL WHERE SKILL.SKILLNAME = skill(i)) );

IF sql%found THEN 
isInserted := true;
ELSIF sql%notfound THEN 
isInserted := false;
END IF; 
COMMIT;

EXCEPTION 
WHEN others THEN 
isInserted := false;

END internsPost;`,

AdminHome_Views:{
    student_view: `create or replace view student_view as SELECT
    1 id,
    COUNT(CASE year WHEN '4' THEN 1 END) finalYear,
    COUNT(CASE year WHEN '3' THEN 1 END) thirdYear,
    COUNT(CASE year WHEN '2' THEN 1 END) secondYear,
    COUNT(CASE year WHEN '1' THEN 1 END) firstYear,
    count(*) student 
    FROM student`, 
    industry_view: `create or replace view industry_view as SELECT 1 id,
    count(*) SOFTWAREHOUSE from INDUSTRIES`,
    INTERNSHIP_view: `create or replace view INTERNSHIP_view as SELECT 1 id,
    count(*) INTERNSHIP from INTERNSHIP`,
    Jobs_view:`create or replace view Jobs_view as SELECT 1 id,
    count(*) Jobs from Jobs`
},
     
};

// EXCEPTION
// WHEN others THEN 
// isInserted := false;


// initialization of oracle sequence object 
 /*  note: This squence is executed once when the new database is setup */

//  CREATE SEQUENCE  "SYSTEM"."STUDENT_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 10 NOORDER  NOCYCLE  NOKEEP  NOSCALE  GLOBAL ;   
//  CREATE SEQUENCE  "SYSTEM"."INDUSTRY_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 10 NOORDER  NOCYCLE  NOKEEP  NOSCALE  GLOBAL ;
//  CREATE SEQUENCE  "SYSTEM"."EXPERIENCE_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 10 NOORDER  NOCYCLE  NOKEEP  NOSCALE  GLOBAL; 
// CREATE SEQUENCE  "SYSTEM"."JOB_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 10 NOORDER  NOCYCLE  NOKEEP  NOSCALE  GLOBAL ;   
// TO_DATE(DOB, 'DD/MM/YYYY')
// CREATE SEQUENCE  "SYSTEM"."INTERNS_SEQ"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 10 NOORDER  NOCYCLE  NOKEEP  NOSCALE  GLOBAL ;   

module.exports = {DDBcon, PDBcon, libPath, SQL, storedProcedures};
