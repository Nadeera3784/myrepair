const nodemailer = require('nodemailer');

const sendmail = async function (request, response, from, to , subject, html) {
    let mailerConfig = {    
        host: "codemelabs.com",  
        //secureConnection: true,
        tls: {
            rejectUnauthorized: false
        },
        secure: true, 
        port: 465,
        auth: {
            user: "nadeera@codemelabs.com",
            pass: "iN?VP0h8eLks"
        }
    };

    let transporter = nodemailer.createTransport(mailerConfig);

    transporter.verify(function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
    });

    let mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: html
    };

    return  new Promise(function (resolve, reject) {
        transporter.sendMail(mailOptions, function (error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }); 
    });

}

module.exports = {
    sendmail
};