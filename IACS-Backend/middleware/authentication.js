const jwt = require('jsonwebtoken');
require('dotenv').config();
const { findSession } = require('../database/oracle');
const { generateAccTkn } = require('./jsonToken');
const { sendAccCookie } = require('./Cookie');


class authentication {

    static #refreshCookieName = 'rcookie';
    static #accessCookieName = 'acookie';

    constructor() {
    }

    static authenticate = async (req, res, next) => {


        const tokens = {
            refCookie: req.cookies[this.#refreshCookieName] || null,
            accCookie: req.cookies[this.#accessCookieName] || null
        };

        const { refKey, accKey } = req.body.config.jsonConfig;

        try {
            const RTkn = new refreshTkn();
            const RTdata = await RTkn.checkTkn(tokens, refKey);
            req.body.refTokenData = RTdata;
            
            const ATkn = new accessTkn();
            const ATdata = await ATkn.checkTkn(tokens, accKey);
            if (ATdata == "expired" && RTdata.clientName == "admin") {
                throw { code: 401, info: "Admincoookie Expired" , authentication : false  , Error: new Error("SingIn Needed") };
            }
             if (ATdata == "expired") {
                const refreshing = new refresher();
                ({ req, res } = await refreshing.refresh(req, res))
            }

            next();
            // res.status(200).end();
        }
        catch (e) {

            // const cookieData = req.body.config.cookieConfig;
            // res.clearCookie( this.#refreshCookieName, {...cookieData})
            // res.clearCookie( this.#accessCookieName,  {...cookieData})    
            res.status(401).send({...e, Error: e.Error.message });
        }
    }
}

class refreshTkn {

    constructor() { }

    checkTkn = async (tokens, key) => {

        return new Promise( ( resolve, reject) => {

            jwt.verify(tokens.refCookie, key, async (err, tokenData) => {
                if (err) {
                    reject (await this.expire_badTkn());
            } else {

                resolve(await this.valid(tokenData));
            }
        });
    }
    )
        
    }

    valid = async (tokenData) => {
        return tokenData;
    }

    expire_badTkn = async () => {
        return await this.error401();
    }

    error401 = async () => {
        return { code: 401, info: "refresh token volated", authentication : false , Error: new Error("SingIn Needed") }
    }
}

class accessTkn {

    constructor() { }

    checkTkn = async (tokens, key) => {

        return new Promise((resolve, reject) => {

            jwt.verify(tokens.accCookie, key, async (err, tokenData) => {

                if (err) {

                    if (err.message == 'jwt expired' || 'jwt must be provided') {

                        resolve(await this.expire_empty());

                    } else {
                        reject(await this.badRequest());
                    }


                } else {

                    resolve(await this.valid(tokenData))

                }

            });

        })

    }

    valid = async (tokenData) => {

        return tokenData;

    }

    expire_empty = async () => {

        return "expired";
    }

    badRequest = async () => {
        return await this.error401();
    }

    error401 = async () => {
        return { code: 401, info: "access token volated" , authentication : false  , Error: new Error("SingIn Needed") }
    }
}

class refresher {

    constructor() { }

    refresh = async (req, res) => {
        const session = await findSession(req);
        if (session == true) {
            const token = await generateAccTkn(req);
            if (typeof (token) == "string") {
                req.body.accToken = token;
                return await sendAccCookie(req, res);
            } else {
                throw token;
            }
        }
        else if (session == false) {

            throw await this.error401();
        } else {
            throw session;
        }
    }


    // findSession = async (req) => {
    //     return await findSession(req); 
    // }


    // generateAccTkn = async (req) => {
    //     return await generateAccTkn(req);
    // }

    // sendAccCookie = async (req, res) => {
    //     return await sendAccCookie(req, res);
    // }


    error401 = async () => {
        return { code: 401, info: "session in database also expired", authentication : false , Error: new Error("SingIn Needed") }
    }

}


module.exports = authentication.authenticate;
