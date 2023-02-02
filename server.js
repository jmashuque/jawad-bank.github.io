const HTTP_PORT = process.env.PORT || 3000;

const express = require("express");
const exphbs = require('express-handlebars');
const path = require("path");
const fs = require("fs");
const bodyParser = require('body-parser');
const session = require("client-sessions");
const randomStr = require("randomstring");
const MongoClient = require('mongodb').MongoClient;
const app = express();

app.engine(".hbs", exphbs({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "/views")  // partials folder is default
}));

app.set("view engine", "hbs");

// var url = "mongodb://localhost:27017/newdb";
var url = "mongodb+srv://jawad_mashuque:jawad555@cluster0.xq1bn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// POPULATE DATA AFTER DELETING PRIOR db1.collection1 ON ATLAS

MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    
    if (err) throw err;

    dbase = db.db("db1");

    // Delete collection1

    dbase.collection("collection1").drop(function(err, delOK) {
        if (err) throw err;
        if (delOK) console.log("Collection collection1 deleted.");
        // db.close();
    });

    // Delete collection1 //

    dbase.createCollection("collection1", function(err, res) {
        if (err) throw err;
        console.log("Collection collection1 created.");
        
        let data = [
            {
                Name: "george.tsang@senecacollege.ca",
                Chequing: "1000001",
                Savings: "1000002"
            },
            {
                Name: "john@beatles.uk",
                Chequing: "1000011",
                Savings: 0
            },
            {
                Name: "paul@beatles.uk",
                Chequing: 0,
                Savings: "1000022"
            },    
            {
                Name: "george@beatles.uk",
                Chequing: "1000031",
                Savings: "1000032"
            },
            {
                Name: "ringo@beatles.uk",
                Chequing: 0,
                Savings: 0
            },
            {
                Name: "mick@rollingstones.uk",
                Chequing: "1000051",
                Savings: "1000052"
            }
        ];

        // Delete collection1 contents

        dbase.collection("collection1").deleteMany({}, (err, res) => {
            if (err) throw err;
            console.log("Deleted documents.");
        });

        // Delete collection1 contents //

        dbase.collection("collection1").insertMany(data, function(err, res) {
            if (err) throw err;
            console.log(`Inserted ${res.insertedCount} documents.`);
        });

        // db.collection("webbank").insertMany(newdata, function(err, res) {
        //     if (err) throw err;
        //     console.log("Added newdata.");
        //     // db.close();
        // });

        // db.collection("webbank").insertMany(newdata2, function(err, res) {
        //     if (err) throw err;
        //     console.log("Added newdata2.");
        //     // db.close();
        // });

        // db.collection("webbank").insertMany(newdata, (err, res) => {
        //     if (err) throw err;
        //     console.log("Data read again.");
        // });

        // db.collection("webbank").insertOne(newdata, function(err, res) {
        //     if (err) throw err;
        //     console.log("Data read again.");
        //     // db.close();
        // });

        // console.log(db.collection("webbank"));

        // db.collection("webbank").findOneAndUpdate({ Name : "timmy.turner@fairy.com" }, 
        //     { $set:
        //         { Chequing : "5050" }
        //     }, 
        //     { returnOriginal : false }, (err, result) => {
        //         if (err) throw err;
        //         console.log("found and updated");
        //         console.log(result);

        //         // results = result;
        //         // results = JSON.parse(result["users"]);

        //         // console.log(result);
        // });

        // db.collection("webbank").findOne({ Name : "john@beatles.uk" }, (err, result) => {
        //     if (err) throw err;
        //     console.log("first result:");
        //     console.log(result);
        //     console.log(result.Name);
        // });

        // db.collection("webbank").find({}).toArray((err, result) => {
        //     if (err) throw err;
        //     console.log("all results");
        //     console.log(result);
        // });

        // db.collection("webbank").find({}).toArray((err, result) => {
        //     if (err) throw err;
        //     console.log("all results again");
        //     console.log(result);
        //     console.log(result["Name.2"]);
        // });

        // db.collection("webbank").findOne(query, (err, result) => {
        //     if (err) throw err;
        //     console.log("found:");
        //     // console.log(result);

        //     // results = result;
        //     results = JSON.parse(result["users"]);

        //     console.log(results);
        // });

        // db.close();
    });
});

var strRandom = randomStr.generate();

app.use(session({
	cookieName: "MySession",
	secret: strRandom,
	duration: 5 * 60 * 1000,
	activeDuration: 1 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
}));

var currentUser;
var currentLastID;
var currentAcc;
var userLoggedIn = false;

// will run every time app gets or posts
app.all('*', function(req, res, next) {
    
    // console.log("touched by " + req.MySession.user + " " +  userLoggedIn);

    if (userLoggedIn) {

        if (req.MySession.user != currentUser) {

            userLoggedIn = false;

            // res.send('404 Session timed out.');
            res.render("home", {
                pagetype: 'LOGIN',
                errors: 'Session timed out.'
            });
        }

        else {

            next();     // move on to next get/post
         }
    }

    else {

        next();
    }
});

app.get("/", (req, res) => {

    res.render("home", {
        pagetype: 'LOGIN'
    });
});

app.get("/logout", (req, res) => {

    userLoggedIn = false;

    req.MySession.reset();
    res.redirect("/");
});

var userInfo = JSON.parse(fs.readFileSync("./user.json"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post("/login", (req, res) => {

    var user = req.body.userBox;
    var pass = req.body.passBox;

    var errorMsg = "Not a registered username.";
    var found = false;

    for (x in userInfo) {

        found = false;

        if (user === x) {

            if (pass === userInfo[x]) {

                found = true;
                break;
            }
            else {

                errorMsg = "Invalid password.";
                break;
            }
        }
    }

    if (found) {

        req.MySession.user = user;

        userLoggedIn = true;

        // console.log(req.MySession.seenyou);

        // console.log(req.MySession.user);

        currentUser = user;
        res.redirect("/account");
    }

    else {

        res.render("home", {
            errors: errorMsg
        });
    }
});

var accountInfo = JSON.parse(fs.readFileSync("./accounts.json"));
var accountRes = "";
var accountC = 0;
var accountS = 0;

app.get("/account", (req, res) => {

    // console.log(req.MySession.seenyou);

    if (userLoggedIn) {

        accountRes = "";
        accountC = 0;
        accountS = 0;

        try {

            MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {

                dbase = db.db("db1");

                var myPromise = () => {

                    return new Promise ((resolve, reject) => {

                        dbase.collection("collection1").findOne({ Name : currentUser }, (err, result) => {
                    
                            // if (err) throw err;
                            console.log("first result:");
                            console.log(result.Name);
                            console.log(result.Chequing);
                            console.log(result.Savings);
                            
                            if (result.Chequing != 0) {
            
                                console.log("chequing exists " + accountRes);
        
                                accountC = result.Chequing;
            
                                accountRes += "<option value=\"" + result.Chequing + "\">" + "Chequing " + result.Chequing + "</option>"
                            }
            
                            if (result.Savings != 0) {
            
                                console.log("savings exists " + accountRes);
        
                                accountS = result.Savings;
            
                                accountRes += "<option value=\"" + result.Savings + "\">" + "Savings " + result.Savings + "</option>";
                            }

                            if (err) {

                                console.log("dbase error");
                                reject(err);
                            }

                            else {

                                console.log("resolved");
                                resolve(result);
                            }
                        });
                    });
                };

                console.log("reached: db read");

                var callMyPromise = async () => {

                    console.log("reached: pre await");

                    var result = await (myPromise());

                    console.log("reached: post await");

                    // res.render("account", {
                    //     pagetype: 'ACCOUNT MANAGER',
                    //     username: currentUser,
                    //     accounts: accountRes
                    // });

                    console.log("accountres: " + accountRes);
                    
                    return result;
                }

                console.log("reached: func defn");

                callMyPromise().then(function (result) {

                    console.log("reached: after promise");

                    res.render("account", {
                        pagetype: 'ACCOUNT MANAGER',
                        username: currentUser,
                        accounts: accountRes
                    });
                });

                console.log("reached: executed");

                // db.close();
            });
        }

        catch (e) {
            
            console.log("mongoclient error");
        }

        // const load_db = () => {

        //     MongoClient.connect(url, function(err, db) {

        //         dbase = db.db("db1");

        //         dbase.collection("collection1").findOne({ Name : currentUser }, (err, result) => {
                    
        //             if (err) throw err;
        //             console.log("first result:");
        //             console.log(result.Name);
        //             console.log(result.Chequing);
        //             console.log(result.Savings);
                    
        //             if (result.Chequing != 0) {
    
        //                 console.log("chequing exists");

        //                 accountC = result.Chequing;
    
        //                 accountRes += "<option value=\"" + result.Chequing + "\">" + "Chequing " + result.Chequing + "</option>"
        //             }
    
        //             if (result.Savings != 0) {
    
        //                 console.log("savings exists");

        //                 accountS = result.Savings;
    
        //                 accountRes += "<option value=\"" + result.Savings + "\">" + "Savings " + result.Savings + "</option>";
        //             }
        //         });

        //         db.close();
        //     });
        // }

        // const load_page =  () => {
        
        //      console.log("reached");
        //      console.log("accountres: " + accountRes);
            
        //     res.render("account", {
        //         pagetype: 'ACCOUNT MANAGER',
        //         username: currentUser,
        //         accounts: accountRes
        //     });
        // }

        // load_db();
        // setTimeout(load_page, 2000);
    }

    else {

        // console.log("unknown user");

        res.render("home", {
            pagetype: 'LOGIN',
            errors: 'Please log in first.'
        });
    }

    
    // console.log("reached account page ", currentUser);

    currentLastID = accountInfo.lastID;
});

app.post("/account", (req, res) => {

    res.render("account", {
        pagetype: 'ACCOUNT MANAGER',
        username: currentUser,
        accounts: accountRes
    });
});

app.post("/accountform", (req, res) => {

    // console.log("reached account form");

    var acc = req.body.acc;
    var sel = req.body.selection;
    
    if (sel === "openaccount") {

        res.render("openacc", {
            pagetype: 'OPEN NEW ACCOUNT',
            username: currentUser
        });
    }
    
    else if (acc === undefined) {

        res.render("account", {
            pagetype: 'ACCOUNT MANAGER',
            username: currentUser,
            accounts: accountRes,
            errors: "Invalid account number."
        });
    }

    else {

        var acc_str = acc.toString().padStart(7, "0")

        if (sel === "balance") {

            if (accountInfo[acc_str] === undefined) {

                res.render("account", {
                    pagetype: 'ACCOUNT MANAGER',
                    username: currentUser,
                    accounts: accountRes,
                    errors: 'Invalid account number.'
                });
            }

            else {

                res.render("balance", {
                    pagetype: 'ACCOUNT BALANCE',
                    username: currentUser,
                    account: acc_str,
                    type: accountInfo[acc_str]["accountType"],
                    bal: accountInfo[acc_str]["accountBalance"].toFixed(2)
                });
            }
        }

        else if (sel === "deposit") {

            if (accountInfo[acc_str] === undefined) {

                res.render("account", {
                    pagetype: 'ACCOUNT MANAGER',
                    username: currentUser,
                    accounts: accountRes,
                    errors: 'Invalid account number.'
                });
            }

            else {

                currentAcc = acc_str;

                app.locals.currentUser = currentUser;
                app.locals.accountRes = accountRes;
                app.locals.currentAcc = currentAcc;
                app.locals.accountInfo = accountInfo;

                res.render("deposit", {
                    pagetype: 'DEPOSIT TO ACCOUNT',
                    username: currentUser,
                    acc: acc_str
                });
            }
        }

        else if (sel === "withdrawal") {

            if (accountInfo[acc_str] === undefined) {

                res.render("account", {
                    pagetype: 'ACCOUNT MANAGER',
                    username: currentUser,
                    accounts: accountRes,
                    errors: 'Invalid account number.'
                });
            }

            else {

                currentAcc = acc_str;

                res.render("withdrawal", {
                    pagetype: 'WITHDRAW FROM ACCOUNT',
                    username: currentUser,
                    acc: acc_str
                });
            }
        }

        else {

            res.render("account", {
                pagetype: 'ACCOUNT MANAGER',
                username: currentUser,
                accounts: accountRes,
                errors: 'Please select an option.'
            });
        }
    }

    
});

const deposit = require("./routes/deposit.js");
const { resolve } = require("path");

app.post("/deposit", deposit);

app.post("/withdrawal", (req, res) => {

    if (req.body.submitButton === "Cancel") {

        res.render("account", {
            pagetype: 'ACCOUNT MANAGER',
            username: currentUser,
            accounts: accountRes
        });
    }

    else {

        var sub = parseFloat(req.body.withdrawBox);
        var bal = parseFloat(accountInfo[currentAcc]["accountBalance"]);

        if (bal < sub) {

            res.render("account", {
                pagetype: 'ACCOUNT MANAGER',
                username: currentUser,
                accounts: accountRes,
                errors: 'Insufficient funds.'
            });
        }

        else {

            accountInfo[currentAcc]["accountBalance"] = bal - sub;

            fs.writeFile("accounts.json", JSON.stringify(accountInfo), function(err) {
                console.log("wrote successfully");
                
            });

            res.render("account", {
                pagetype: 'ACCOUNT MANAGER',
                username: currentUser,
                accounts: accountRes,
                errors: '$' + sub.toFixed(2) + ' withdrawn from account ' + currentAcc
            });
        }
    }
});

app.post("/openaccform", (req, res) => {

    if (req.body.submitButton === "Cancel") {

        res.render("account", {
            pagetype: 'ACCOUNT MANAGER',
            username: currentUser,
            accounts: accountRes,
        });
    }

    else {

        var sel = req.body.selection;

        console.log("chequing" + accountC);
        console.log("savings" + accountS);

        if (sel === "Chequing" || sel === "Savings") {

            if (sel === "Chequing" && accountC != 0) {

                res.render("account", {
                    pagetype: 'ACCOUNT MANAGER',
                    username: currentUser,
                    accounts: accountRes,
                    errors: "You are allowed only one Chequing Account."
                });
            }

            else if (sel === "Savings" && accountS != 0) {

                res.render("account", {
                    pagetype: 'ACCOUNT MANAGER',
                    username: currentUser,
                    accounts: accountRes,
                    errors: "You are allowed only one Savings Account."
                });
            }

            else {

                var last = parseInt(accountInfo["lastID"]) + 1;

                // console.log(last);
                
                var last_str = last.toString().padStart(7, "0")
    
                accountInfo["lastID"] = last_str;
    
                currentLastID = last_str;
    
                accountInfo[last_str]= {
                    "accountType" : sel,
                    "accountBalance" : 0
                };
    
                // console.log(accountInfo);
    
                fs.writeFile("accounts.json", JSON.stringify(accountInfo), function(err) {
                    console.log("wrote successfully");
                    
                });

                try {

                    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {

                        dbase = db.db("db1");

                        var myPromise = () => {

                            return new Promise ((resolve, reject) => {

                                dbase.collection("collection1").findOneAndUpdate({ Name : currentUser }, 
                                    { $set:
                                        { [sel] : last_str }
                                    }, 
                                    { returnOriginal : false }, (err, result) => {

                                        // if (err) throw err;

                                        console.log("updated new acc");
                                        console.log(result);

                                        if (err) {

                                            console.log("dbase error");
                                            reject(err);
                                        }
                     
                                        else {
                     
                                            console.log("resolved");
                                            resolve(result);
                                        }
                                    }
                                );

                                accountRes += "<option value=\"" + last_str + "\">" + sel + " " + last_str + "</option>"

                                dbase.collection("collection1").find({}).toArray((err, result) => {
                                    
                                    // if (err) throw err;

                                    console.log("post update accs");
                                    console.log(result);

                                    if (err) {

                                        console.log("dbase error");
                                        reject(err);
                                    }
                 
                                    else {
                 
                                        console.log("resolved");
                                        resolve(result);
                                    }
                                });
                            });
                        };

                        console.log("reached: db read");

                        var callMyPromise = async () => {

                            console.log("reached: pre await");

                            var result = await (myPromise());

                            console.log("reached: post await");

                            // res.render("account", {
                            //     pagetype: 'ACCOUNT MANAGER',
                            //     username: currentUser,
                            //     accounts: accountRes
                            // });

                            console.log("accountres: " + accountRes);
                            
                            return result;
                        }

                        console.log("reached: func defn");

                        callMyPromise().then(function (result) {

                            console.log("reached: after promise");

                            if (sel === "Chequing") {

                                accountC = last_str;
                            }
        
                            else {
        
                                accountS = last_str;
                            }
        
                            var msg = sel + " Account #" + last_str + " created.";
        
                            console.log("accountres after openacc: " + accountRes);
        
                            res.render("account", {
                                pagetype: 'ACCOUNT MANAGER',
                                username: currentUser,
                                accounts: accountRes,
                                errors: msg
                            });
                        });

                        console.log("reached: executed");
                    });
                }

                catch (e) {

                    console.log("mongoclient error");
                }
            }
        }
    }
});

app.get("/logo.png", (req, res) => {

    res.sendFile(path.join(__dirname, "./images/logo.png"));
});

const server = app.listen(HTTP_PORT, function() {
	console.log("Listening on port " + HTTP_PORT);
});
