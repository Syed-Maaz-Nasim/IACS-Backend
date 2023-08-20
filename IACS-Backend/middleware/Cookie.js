let accessCookieName = 'acookie';
let refreshCookieName = 'rcookie';

const sessionCookie = async (req, res) => {

    const cookieData = req.body.config.cookieConfig;
    const { accExpiresIn } = req.body.config.jsonConfig;
    const refExpiresIn = req.body.tokenData.exp;

    res.cookie(refreshCookieName, req.body.refToken, { maxAge: (refExpiresIn * 1000) - Date.now(), ...cookieData });
    res.cookie(accessCookieName, req.body.accToken, { maxAge: accExpiresIn, ...cookieData });
    res.send(JSON.stringify({ id: req.body.id, clientName: req.body.clientName }));
}

const AdminSessionCookie = async (req, res) => {

    const cookieData = req.body.config.cookieConfig;
    const refExpiresIn = (req.body.tokenData.exp * 1000) - Date.now();
    const accExpiresIn = refExpiresIn;

    res.cookie(refreshCookieName, req.body.refToken, { maxAge: refExpiresIn, ...cookieData });
    res.cookie(accessCookieName, req.body.accToken, { maxAge: accExpiresIn, ...cookieData });
    res.send();
}
const clearUserCookie = async (req, res, next) => {

    const refCookie = req.cookies[refreshCookieName] || false;
    const accCookie = req.cookies[accessCookieName] || true;
    const cookieData = req.body.config.cookieConfig;


    if (!(accCookie && refCookie)) {
        res.status(400).end();
    }
    else {

        res.clearCookie(refreshCookieName, { ...cookieData })
        res.clearCookie(accessCookieName, { ...cookieData })
        req.body.refToken = refCookie;
        // req.body.accToken = accCookie;
        next();

    }

}

const AdminclearUserCookie = async (req, res,) => {

    const refCookie = req.cookies[refreshCookieName] || false;
    const accCookie = req.cookies[accessCookieName] || true;
    const cookieData = req.body.config.cookieConfig;


    if (!(accCookie && refCookie)) {
        res.status(400).end();
    }
    else {

        res.clearCookie(refreshCookieName, { ...cookieData })
        res.clearCookie(accessCookieName, { ...cookieData })
        req.body.refToken = refCookie;
        res.status(200).end();
    }

}

const getCookieData = async (req, res, next) => {
    const refCookie = req.cookies[refreshCookieName] || false;
    const accCookie = req.cookies[accessCookieName] || false;

    if (accCookie && refCookie) {
        req.body.refToken = refCookie;
        req.body.accToken = accCookie;
        next();
    }
    else if (!(accCookie) && (refCookie)) {
        req.body.refToken = refCookie;
        req.body.accToken = accCookie;
        next();
    }
    else if (!(accCookie && refCookie) || (accCookie) && !(refCookie)) {
        res.status(406).send("login");
    }
}

const checkCookie = async (req, res, next) => {

    const refCookie = req.cookies[refreshCookieName] || false;
    const accCookie = req.cookies[accessCookieName] || false;

    if (accCookie && refCookie) {
        req.body.refToken = refCookie;
        req.body.accToken = accCookie;
        next();
    } else {
        res.status(401).send("Expire or Empty");
    }

}

const sendAccCookie = async (req, res) => {

    const cookieData = req.body.config.cookieConfig;
    const { accExpiresIn } = req.body.config.jsonConfig;

    res.cookie(accessCookieName, req.body.accToken, { maxAge: accExpiresIn, ...cookieData });

    return { req, res };
}


module.exports = { sessionCookie, clearUserCookie, AdminclearUserCookie, AdminSessionCookie, getCookieData, sendAccCookie, checkCookie };
