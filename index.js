const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;

//const dbURL = `mongodb+srv://Nishu2696Url:Goku1996!@cluster0.fsljb.mongodb.net/myRegistration?retryWrites=true&w=majority`;
const dbURL = `mongodb+srv://${process.env.D_USER}:${process.env.D_PASSWORD}@cluster0.fsljb.mongodb.net/myRegistration?retryWrites=true&w=majority`;
//const dbURL = encode.uri(process.env.DBURL);
console.log("dbURL", dbURL);

const bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");

require("dotenv").config();

const jwt = require("jsonwebtoken");

const cryptoRandomString = require("crypto-random-string");

//const mongoose = require('mongoose');

// mongoose.connect(`mongodb+srv://${process.env.D_USER}:${process.env.D_PASSWORD}@cluster0.fsljb.mongodb.net/myRegistration?retryWrites=true&w=majority`);
// mongoose.connect(`mongodb+srv://Nishu2696Url:Goku1996!@cluster0.fsljb.mongodb.net/myRegistration?retryWrites=true&w=majority`);

// const { UrlModel } = require('./models/urlshort');

app.listen(port, () => {
    console.log("hello");
    console.log("listening in port " + port)
});


//displaying all the urls

app.get('/urlshortnerapi', async function (req, res) {
    console.log("hi shortened url");
    // UrlModel.find(function (err, result) {
    //     console.log("result", result);
    //     if (err) throw err;
    //     res.send(result);
    //     // res.render('http://localhost:4200/urlshortner', {
    //     //     urlResult: result
    //     // })
    //     // res.json({
    //     //     longUrl: result.longUrl,
    //     //     shortUrl: result.shortUrl
    //     // });
    // })

    const client = new mongoClient(dbURL, { useNewUrlParser: true });

    try {
        // Use connect method to connect to the Server
        await client.connect();

        if (err) throw err;
        let db = client.db("myRegistration");
        db.collection("url").find(function (err, result) {
            console.log("result", result);
            if (err) throw err;
            res.send(result);
        });
        //const db = client.db(dbName);
    } catch (err) {
        console.log(err.stack);
    }

    client.close();
    // mongoClient.connect(dbURL, (err, client) => {
    //     if (err) throw err;
    //     let db = client.db("myRegistration");
    //     db.collection("url").find(function (err, result) {
    //         console.log("result", result);
    //         if (err) throw err;
    //         res.send(result);
    //     });
    // });
});

//creating shorturl...

app.post('/createurlshortner',async function (req, res) {
    // 1st try for shortening


    // let url = req.body.url;
    // let ran = Math.random().toString(32).substring(7);
    // let short_url = `${process.env.shorturl}/${ran}`;
    // let email = req.body.email;
    // let count = 0;
    // let reference = 0;
    // let timestamp = new Date();
    // let clicks = [];
    // let client = await mongodb.connect(dbURL).catch((err) => { throw err; });
    // let db = client.db("urlshortener");
    // let obj = {
    //         url: url,
    //         short_url: short_url,
    //         count: count,
    //         timestamp: timestamp,
    //         clicks: clicks
    //     }
    //     // console.log(obj);
    // let data = await db.collection("users").updateOne({ email: email }, { $push: { urls: obj } }).catch((err) => { throw err });
    // let data1 = await db.collection("shorturls").insertOne({ email, url, short_url, count, clicks, timestamp, reference });
    // client.close();
    // res.status(200).json({
    //     message: "Created short url succefully",
    //     short_url
    // })

    //2nd try for shortening


    // let urlShort = new UrlModel({
    //     longUrl: req.body.longUrl,
    //     shortUrl: generateUrl()
    // })

    // urlShort.save(function (err, data) {
    //     if (err) throw err;
    //     //res.redirect('/urlshortner');
    //     if (data) {
    //         console.log(data);
    //         res.send({
    //             data: "short URL has been updated"
    //         })
    //         // res.status(200).json({
    //         //     msg: "Short URL successfully created"
    //         // });
    //         //res.redirect("http://localhost:4200/urlshortner");
    //     }
    // })

    //3rd try for shortening


    console.log("getting longurl");

    const client = new mongoClient(dbURL, { useNewUrlParser: true });

    try {
        // Use connect method to connect to the Server
        await client.connect();

        if (err) throw err;
        let urls = {
            longUrl: req.body.longUrl,
            shortUrl: generateUrl(),
            count: 0
        };
        console.log("urls", urls);
        let db = client.db("myRegistration");
        db.collection("url").insertOne(urls, (err, data) => {
            console.log("hi longurl and shorturl has been inserted");
            if (err) throw err;
            console.log(data);
            client.close();
            res.send({
                data: "short URL has been updated"
            })
            // res.status(200).json({
            //     msg: "Short URL successfully created"
            // });
        });
        //const db = client.db(dbName);
    } catch (err) {
        console.log(err.stack);
    }

    client.close();
    // mongoClient.connect(dbURL, (err, client) => {
    //     if (err) throw err;
    //     let urls = {
    //         longUrl: req.body.longUrl,
    //         shortUrl: generateUrl(),
    //         count: 0
    //     };
    //     console.log("urls", urls);
    //     let db = client.db("myRegistration");
    //     db.collection("url").insertOne(urls, (err, data) => {
    //         console.log("hi longurl and shorturl has been inserted");
    //         if (err) throw err;
    //         console.log(data);
    //         client.close();
    //         res.send({
    //             data: "short URL has been updated"
    //         })
    //         // res.status(200).json({
    //         //     msg: "Short URL successfully created"
    //         // });
    //     });
    // });
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

app.get('/:urlId',async function (req, res) {
    // UrlModel.findOne({ shortUrl: req.params.urlId }, function (err, data) {
    //     if (err) throw err;

    //     UrlModel.updateOne({ shortUrl: req.params.urlId }, { $inc: { clickCount: 1 } }, function (err, updatedData) {
    //         if (err) throw err;
    //         console.log(updatedData);
    //         res.send(updatedData);
    //     })


    // })

    console.log("shorturl", req.params.urlId);

    const client = new mongoClient(dbURL, { useNewUrlParser: true });

    try {
        // Use connect method to connect to the Server
        await client.connect();
    
        let db = client.db("myRegistration");
        db.collection("url").findOne({ email: req.body.email }, (err, data) => {
            if (err) throw err;
            if (data) {
                db.collection("url").updateOne({ shortUrl: req.params.urlId }, { $inc: { count: 1 } }, (err, updateddata) => {
                    if (err) throw err;
                    client.close();
                    console.log(updatedData);
                    res.send(updateddata);
                    //res.status(200).json(data);
                });
            }
        });
        //const db = client.db(dbName);
      } catch (err) {
        console.log(err.stack);
      }
    
      client.close();
    // mongoClient.connect(dbURL, (err, client) => {
    //     if (err) throw err;
    //     let db = client.db("myRegistration");
    //     db.collection("url").findOne({ email: req.body.email }, (err, data) => {
    //         if (err) throw err;
    //         if (data) {
    //             db.collection("url").updateOne({ shortUrl: req.params.urlId }, { $inc: { count: 1 } }, (err, updateddata) => {
    //                 if (err) throw err;
    //                 client.close();
    //                 console.log(updatedData);
    //                 res.send(updateddata);
    //                 //res.status(200).json(data);
    //             });
    //         }
    //     });
    // });
})

//creating an API for registration
app.post("/register", async (req, res) => {
    //connecting to the mongo
    const client = new mongoClient(dbURL, { useNewUrlParser: true });
    try {
        // Use connect method to connect to the Server
        await client.connect();
        let db = client.db("myRegistration");
        db.collection("users").findOne({ email: req.body.email }, async (err, data) => {
            if (err) throw err;
            if (data) {//if email already exists dont allow to create a new one
                res.status(400).json({
                    msg: "E-mail already exist"
                });
            }
            else {
                let user_data = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                    phonenumber: req.body.phone_number,
                    active: false
                }

                let key = cryptoRandomString({ length: 10, type: "url-safe" });
                let sessionLink = `${req.body.email}/ ${key}`;
                let link = "http://localhost:4200/verificationemail/";

                let sent_to = req.body.email;
                console.log("name_1", sent_to);

                let transporter = await nodemailer.createTransport({
                    //host: "smtp.ethereal.email",
                    //port: 587,
                    //secure: false, // true for 465, false for other ports
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL, // generated ethereal user
                        pass: process.env.PASSWORD, // generated ethereal password
                    },
                    /*tls: {
                        rejectUnauthorized: false
                    }*/
                });

                let info = await transporter.sendMail({
                    from: '"Nodemailer Contact" <marcnishaanth2696@gmail.com>', // sender address
                    to: `"${sent_to}", nishaanth2696@gmail.com`, // list of receivers
                    subject: "verification Link", // Subject line
                    text: "Hello world?", // plain text body
                    html: `<p>Please follow this link :</p></br>
                                           <a href=${link + sessionLink}>Click HERE</a>`, // html body
                });

                console.log("Message sent: %s", info.messageId);
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                // Preview only available when sending through an Ethereal account
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

                bcrypt.genSalt(10, (err, salt) => {
                    console.log("password", req.body.password);
                    console.log("salt", salt);
                    //converting the user password with hashed password
                    bcrypt.hash(req.body.password, salt, function (err, hash) {
                        console.log("hash", hash);
                        req.body.password = hash;//storing the hashed password and replacing it with the original password
                        console.log("new password", req.body.password);
                        db.collection("users").insertOne(user_data, (err, data) => {
                            // saving the stored password and email to the database
                            console.log("hello");
                            if (err) throw err;
                            console.log(data);
                            res.status(200).json(data);
                        });
                    });
                });
            }
        });

        //const db = client.db(dbName);
    } catch (err) {
        console.log(err.stack);
    }
    client.close();
});

app.post("/verificationemail", async (req, res) => {
    console.log("email", req.body.email);
    const client = new mongoClient(dbURL, { useNewUrlParser: true });

    try {
        // Use connect method to connect to the Server
        await client.connect();

        let db = client.db("myRegistration");
        db.collection("users").findOne({ email: req.body.email }, (err, data) => {
            if (err) throw err;
            if (data) {
                db.collection("users").updateOne({ email: req.body.email }, { $set: { active: true } }, (err, data) => {
                    if (err) throw err;
                    client.close();
                    res.status(200).json(data);
                });
            }
        });
        //const db = client.db(dbName);
    } catch (err) {
        console.log(err.stack);
    }
    client.close();
})

app.post("/login", async (req, res) => {
    const client = new mongoClient(dbURL, { useNewUrlParser: true });

    try {
        // Use connect method to connect to the Server
        await client.connect();

        let db = client.db("myRegistration");
        db.collection("users").findOne({ email: req.body.email }, (err, data) => {
            if (err) throw err;
            if (data.active == true) {
                if (req.body.password == data.password) {
                    res.status(200).json({
                        msg: "success"
                    });
                }
                else {
                    res.status(401).json({
                        msg: "Unauthorized / wrong Password"
                    })
                }
                // console.log(req.body.password, "login");
                // console.log(data.password, "register");
                // bcrypt.compare(req.body.password, data.password, (err, result) => {
                //     console.log(result);
                //     if (err) throw err;
                //     if (result) {
                //         res.status(200).json({
                //             msg: "Success"
                //         });
                //     }
                //     else {
                //         res.status(401).json({
                //             msg: "Unauthorized / Wrong Password"
                //         });
                //     }
                // });

            }
            else {
                res.status(401).json({
                    msg: "Verification not done yet/ Invalid E-mail"
                });
            }
        })
        //const db = client.db(dbName);
    } catch (err) {
        console.log(err.stack);
    }

    client.close();
    // mongoClient.connect(dbURL, (err, client) => {
    //     if (err) throw err;
    //     let db = client.db("myRegistration");
    //     db.collection("users").findOne({ email: req.body.email }, (err, data) => {
    //         if (err) throw err;
    //         if (data.active == true) {
    //             if (req.body.password == data.password) {
    //                 res.status(200).json({
    //                     msg: "success"
    //                 });
    //             }
    //             else {
    //                 res.status(401).json({
    //                     msg: "Unauthorized / wrong Password"
    //                 })
    //             }
    //             // console.log(req.body.password, "login");
    //             // console.log(data.password, "register");
    //             // bcrypt.compare(req.body.password, data.password, (err, result) => {
    //             //     console.log(result);
    //             //     if (err) throw err;
    //             //     if (result) {
    //             //         res.status(200).json({
    //             //             msg: "Success"
    //             //         });
    //             //     }
    //             //     else {
    //             //         res.status(401).json({
    //             //             msg: "Unauthorized / Wrong Password"
    //             //         });
    //             //     }
    //             // });

    //         }
    //         else {
    //             res.status(401).json({
    //                 msg: "Verification not done yet/ Invalid E-mail"
    //             });
    //         }
    //     })
    //     /*db.collection("users").findOne({ email: req.body.email, password: req.body.password }, (err, data) => {
    //         if (err) throw err;
    //         client.close();
    //     })*/
    // });
});

app.post("/changepassword", async (req, res) => {

    let random = Math.floor(Math.random() * 90000) + 10000;
    let key = cryptoRandomString({ length: 10, type: "url-safe" });
    let sessionLink = `${req.body.email}/ ${key}`;

    if (!req.body.email) {
        res.status(400).json({
            msg: "E-mail Id needed"
        });
    }


    let sent_to = req.body.email;
    console.log("name_1", sent_to);

    let link = "http://localhost:4200/resetpassword/";

    const client = new mongoClient(dbURL, { useNewUrlParser: true });

    try {
        // Use connect method to connect to the Server
        await client.connect();

        let db = client.db("myRegistration");
        db.collection("users").findOne({ email: req.body.email }, async (err, data) => {
            if (err) throw err;
            if (data) {
                //create reusable transporter object using the default SMTP transport
                let transporter = await nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL, // generated ethereal user
                        pass: process.env.PASSWORD, // generated ethereal password
                    },
                });

                // send mail with defined transport object
                let info = await transporter.sendMail({
                    from: '"Nodemailer Contact" <marcnishaanth2696@gmail.com>', // sender address
                    to: `"${sent_to}", nishaanth2696@gmail.com`, // list of receivers
                    subject: "Hello ✔", // Subject line
                    text: "Hello world?", // plain text body
                    html: `<p>Please follow this link :</p></br>
                            <p>${link + sent_to}</p>
                           <a href=${link + sent_to}>Click HERE</a>`, // html body
                    //html: `<b>"${random}"</b>`, // html body
                });

                console.log("Message sent: %s", info.messageId);
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                // Preview only available when sending through an Ethereal account
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou..
            }
            //client.close();
        });
        //const db = client.db(dbName);
    } catch (err) {
        console.log(err.stack);
    }

    client.close();


    // mongoClient.connect(dbURL, (err, client) => {
    //     let db = client.db("myRegistration");
    //     db.collection("users").findOne({ email: req.body.email }, async (err, data) => {
    //         if (err) throw err;
    //         if (data) {
    //             //create reusable transporter object using the default SMTP transport
    //             let transporter = await nodemailer.createTransport({
    //                 service: "gmail",
    //                 auth: {
    //                     user: process.env.EMAIL, // generated ethereal user
    //                     pass: process.env.PASSWORD, // generated ethereal password
    //                 },
    //             });

    //             // send mail with defined transport object
    //             let info = await transporter.sendMail({
    //                 from: '"Nodemailer Contact" <marcnishaanth2696@gmail.com>', // sender address
    //                 to: `"${sent_to}", nishaanth2696@gmail.com`, // list of receivers
    //                 subject: "Hello ✔", // Subject line
    //                 text: "Hello world?", // plain text body
    //                 html: `<p>Please follow this link :</p></br>
    //                         <p>${link + sent_to}</p>
    //                        <a href=${link + sent_to}>Click HERE</a>`, // html body
    //                 //html: `<b>"${random}"</b>`, // html body
    //             });

    //             console.log("Message sent: %s", info.messageId);
    //             // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    //             // Preview only available when sending through an Ethereal account
    //             console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    //             // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou..
    //         }
    //         client.close();
    //     });

    // })

});

app.post("/interchangepassword", async (req, res) => {

    const client = new mongoClient(dbURL, { useNewUrlParser: true });

    try {
        // Use connect method to connect to the Server
        await client.connect();

        if (err) throw err;
        let db = client.db("myRegistration");
        db.collection("users").findOne({ email: req.body.email }, (err, data) => {
            if (err) throw err;
            if (data) {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, function (err, hash) {
                        req.body.password = hash;
                        db.collection("users").updateOne({ email: req.body.email }, { $set: { password: req.body.password } }, (err, data) => {
                            if (err) throw err;
                            client.close();
                            res.status(200).json(data);
                        });
                    });
                });
            }
            else {
                res.status(401).json({
                    msg: "Invalid E-mail"
                });
            }
        });

        //const db = client.db(dbName);
    } catch (err) {
        console.log(err.stack);
    }

    client.close();
    // mongoClient.connect(dbURL, (err, client) => {
    //     if (err) throw err;
    //     let db = client.db("myRegistration");
    //     db.collection("users").findOne({ email: req.body.email }, (err, data) => {
    //         if (err) throw err;
    //         if (data) {
    //             bcrypt.genSalt(10, (err, salt) => {
    //                 bcrypt.hash(req.body.password, salt, function (err, hash) {
    //                     req.body.password = hash;
    //                     db.collection("users").updateOne({ email: req.body.email }, { $set: { password: req.body.password } }, (err, data) => {
    //                         if (err) throw err;
    //                         client.close();
    //                         res.status(200).json(data);
    //                     });
    //                 });
    //             });
    //         }
    //         else {
    //             res.status(401).json({
    //                 msg: "Invalid E-mail"
    //             });
    //         }
    //     });
    // });
});