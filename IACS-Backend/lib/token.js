let generateTknTime = (refExpiresIn) => {

    let javaDate = new Date();
    
    const iat = Math.floor(Date.now() / 1000);
    
    //represent seconds of next day of night 3:00 am
    const exp = Math.floor(javaDate.setHours(refExpiresIn, 59, 59, 0)/1000); 
    

    return { 
        iat,
        exp,
        sessionID : iat 
    }

}

module.exports = {generateTknTime};