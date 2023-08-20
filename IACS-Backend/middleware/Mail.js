const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { text } = require('express');

// These id's and secrets should come from .env file.
const CLIENT_ID = '746046349885-5bg7a04e40cdncshetgbqgemegqooo14.apps.googleusercontent.com';
const CLEINT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = "1//04hNK1E_kyT5ACgYIARAAGAQSNwF-L9Ir2AXBbmI6M0VM6053uY8ROz1RaJDFeFtUZYFnt9ZnVJtYerkwLoqpjLz8S_NYK9Fshh4";


const sendMail = async (req, res) => {

  const { OTP, email, token } = req.body;

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLEINT_SECRET,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  async function sendMail() {
    try {
      const accessToken = await oAuth2Client.getAccessToken();
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'IACS.Corporation@gmail.com',
          clientId: CLIENT_ID,
          clientSecret: CLEINT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });
      const mailOptions = {
        from: 'IACS <IACS.Corporation@gmail.com>',
        to: email,
        subject: 'OTP for IACS Account Creation',
        text: `${OTP}`,
      };
      console.log(text)
      console.log(mailOptions)
      const result = await transport.sendMail(mailOptions);
      return result;
    }
    catch (error) {
      return error;
    }
  }
  sendMail()
    .then((result) => {
      res.status(200).send({ token });
      //     console.log('Email sent: ' , result);
    })
    .catch((error) => {
      res.status(400).send();
    });
}

module.exports = { sendMail };

