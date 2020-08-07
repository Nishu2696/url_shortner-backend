const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method == 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,PATCH");
        return res.status(200).json({});
    }
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const dbURL = `mongodb+srv://Nishu1234:nish34248@cluster0.fsljb.mongodb.net/urlshortner?retryWrites=true&w=majority`;

//const dbURL = process.env.DBURL;
console.log("dbURL", dbURL);

const bcrypt = require("bcryptjs");

var atob = require('atob');

let jwt = require('jsonwebtoken');
let reference = 0;

var nodemailer = require("nodemailer");

require("dotenv").config();

const cryptoRandomString = require("crypto-random-string");

const mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://Nishu1234:nish34248@cluster0.fsljb.mongodb.net/urlshortner?retryWrites=true&w=majority`, {
    useCreateIndex: true,
    useNewUrlParser: true
}).then(() => console.log('DB Connected!'))
    .catch(err => {
        console.log(`DB Connection Error: ${err.message}`);
    });

const { UrlModel } = require('./models/urlshort');

app.listen(port, () => {
    console.log("hello");
    console.log("listening in port " + port)
});

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

let mailOptions = {
    from: process.env.EMAIL,
    to: '',
    subject: 'Sending Email using Node.js',
    html: `<h1>Hi from node</h1><p> Messsage</p>`
};

async function authenticate(req, res, next) {
    if (req.headers.authorization == undefined) {
        res.status(401).json({
            message: "No token present"
        })
    } else {
        jwt.verify(req.headers.authorization, 'qwertyuiopasdfghjkl', (err, decoded) => {
            if (err) {
                res.status(401).json({
                    message: "Session Expired,Please Login again"
                })
                return;
            } else if (decoded.isVerified == false) {
                res.status(401).json({
                    isVerified: false,
                    message: "Verify the account to enjoy the service"
                })
                // console.log(decoded);
            }
            next();
        })
    }
}


//displaying all the urls

app.get('/urlshortnerapi', function (req, res) {
    console.log("hi shortened url");
    UrlModel.find(function (err, result) {
        console.log("result", result);
        if (err) throw err;
        res.send(result);
    })
});

//creating shorturl...

app.post('/createurlshortner', function (req, res) {

    let urlShort = new UrlModel({
        longUrl: req.body.longUrl,
        shortUrl: generateUrl()
    })

    urlShort.save(function (err, data) {
        if (err) throw err;
        //res.redirect('/urlshortner');
        if (data) {
            console.log(data);
            res.send({
                data: "short URL has been updated"
            })
        }
    })
});

//function to generate random letters and numbers and storing it in shorturl...

function generateUrl() {
    var rndResult = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;

    for (var i = 0; i < 5; i++) {
        rndResult += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    console.log(rndResult)
    return rndResult
}

//redirecting to the original login page with the help of short url link and updating the click count...

app.get('/:urlId', function (req, res) {
    UrlModel.findOne({ shortUrl: req.params.urlId }, function (err, data) {
        if (err) throw err;

        UrlModel.updateOne({ shortUrl: req.params.urlId }, { $inc: { clickCount: 1 } }, function (err, updatedData) {
            if (err) throw err;
            console.log(updatedData);
            let urlvalue = {
                shortUrl: data.longUrl,
                clickCount: updatedData.clickCount
            }
            res.redirect(urlvalue["shortUrl"]);
        })


    })
});

//creating an API for registration
app.post('/register', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    if (email === undefined || password === undefined) {
        res.status(400).json({
            message: 'Fields missing'
        });
    } else {
        let client = await MongoClient.connect(dbURL).catch((err) => { throw err; });
        let db = client.db('urlshortner');
        let data = await db.collection('users').findOne({ email }).catch((err) => { throw err; });
        if (data) {
            res.status(400).json({
                message: 'Email already registered'
            });
        } else {
            let saltRounds = 10;
            let salt = await bcrypt.genSalt(saltRounds).catch((err) => { throw err; });
            let hash = await bcrypt.hash(password, salt).catch((err) => { throw err; });
            password = hash;
            let accountVerified = false;
            await db.collection('users').insertOne({ email, firstName, lastName, password, accountVerified }).catch(err => { throw err; });
            let buf = await require('crypto').randomBytes(32);
            let token = buf.toString('hex');
            await db.collection('users').updateOne({ email }, { $set: { verificationToken: token } });
            client.close();
            console.log(process.env.urldev);
            mailOptions.to = email;
            mailOptions.subject = 'URL-SHORTNER-Account verification '
            mailOptions.html = `<html><body><h1>Account Verification Link</h1>
                                 <h3>Click the link below to verify the account</h3>
                                <a href='${process.env.urldev}/verifyaccount/${token}/${req.body.email}'>${process.env.urldev}/verifyaccount/${token}/${req.body.email}</a><br>`;
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log("line-189", error);
                    res.status(500).json({
                        message: "An error occured,Please try again later"
                    })
                } else {
                    console.log('Email sent: ' + info.response);
                    res.status(200).json({
                        message: `Registration Successfull,Verification mail sent to ${email}`,
                    })
                    client.close();
                }
            });
        }
    }
});

app.post('/accountverification', async (req, res) => {
    let { verificationToken, email } = req.body;
    let client = await mongodb.connect(dbURL).catch(err => { throw err });
    let db = client.db('urlshortner');
    let data = await db.collection('users').findOne({ email}).catch(err => { throw err });
    if (data) {
        await db.collection('users').updateOne({ email }, { $set: { verificationToken: '', accountVerified: true } });
        client.close();
        res.status(200).json({
            message: 'Account verification succesfull'
        });
    } else {
        res.status(400).json({
            message: 'Account Verification failes, retry again'
        });
    }
});

app.post('/forgotpassword', async (req, res) => {
    let { email } = req.body;
    let client = await mongodb.connect(dbURL).catch(err => { throw err; });
    let db = client.db('urlshortner');
    let data = await db.collection('users').findOne({ email }).catch(err => { throw err });
    if (data) {
        let buf = await require('crypto').randomBytes(32);
        let token = buf.toString('hex');
        await db.collection('users').updateOne({ email }, { $set: { passwordResetToken: token } });
        client.close();
        mailOptions.to = email;
        mailOptions.subject = 'URL-SHORTNER-Password reset';
        mailOptions.html = `<html><body><h1>Password reset Link</h1>
        <h3>Click the link below to reset password</h3>
       <a href='${process.env.urldev}/#/verifyaccount/${token}/${req.body.email}'>${process.env.urldev}/#/verifyaccount/${token}/${req.body.email}</a><br>`;
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.status(500).json({
                    message: "An error occured,Please try again later"
                })
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).json({
                    message: `Verification mail sent to ${req.body.email}`,
                })
                client.close();
            }
        });

    } else {
        res.status(400).json({
            message: 'Email does not exist'
        });
    }
});

app.post('/resetpassword', async (req, res) => {
    let { email, password, passwordResetToken } = req.body;
    let client = await mongodb.connect(dbURL).catch(err => { throw err });
    let db = client.db('urlshortner');
    let data = await db.collection('users').findOne({ email, passwordResetToken }).catch(err => { throw err });
    if (data) {
        let saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds).catch((err) => { throw err; });
        let hash = await bcrypt.hash(password, salt).catch((err) => { throw err; });
        password = hash;
        await db.collection('users').updateOne({ email, passwordResetToken }, { $set: { password, passwordResetToken: "" } }).catch(err => { throw err });
        res.status(200).json({
            message: 'Password reset successfull'
        });
    } else {
        res.status(400).json({
            message: 'Password reset failed, Try reseting again'
        });
    }
    client.close();
});

app.post("/login", async (req, res) => {
    let { email, password } = req.body;
    if (email === undefined || password === undefined) {
        res.status(400).json({
            message: 'Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL).catch(err => { throw err; });
        let db = client.db('urlshortner');
        let data = await db.collection('users').findOne({ email }).catch(err => { throw err; });
        if (data) {
            if (data.accountVerified) {
                bcrypt.compare(password, data.password, function (err, result) {
                    if (err) throw err;
                    if (result) {
                        jwt.sign({ id: data["_id"], email: data["email"], userType: data["userType"], accessRights: data['accessRights'] }, 'qwertyuiopasdfghjkl', { expiresIn: '10h' }, function (err, token) {
                            if (err) throw err;
                            client.close();
                            res.status(200).json({
                                message: "login successfull",
                                token,
                                email
                            })
                        });
                    } else {
                        client.close();
                        res.status(401).json({
                            message: "password incorrect"
                        })
                    }
                })
            } else {
                res.status(400).json({
                    message: 'verify your account to login'
                });
            }

        } else {
            client.close();
            res.status(400).json({
                message: 'User not found'
            })
        }
    }

});