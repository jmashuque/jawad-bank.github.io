/*
    Name: Jawad Mashuque
    File: server.js (Web Bank 2)
    Course: WEB322
    Created: 06-Aug-2020
    Modified: 06-Aug-2020
*/

const express = require("express");
const fs = require("fs");
const bodyParser = require('body-parser');
const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

router.post("/deposit", (req, res) => {

    // console.log("currentUser: " + req.app.get('currentUser'));
    console.log("currentUser: " + req.app.locals.currentUser);
    console.log("accountRes: " + req.app.locals.accountRes);

    if (req.body.submitButton === "Cancel") {

        res.render("account", {
            pagetype: 'ACCOUNT MANAGER',
            username: req.app.locals.currentUser,
            accounts: req.app.locals.accountRes
        });
    }

    else {

        var add = parseFloat(req.body.depositBox);

        req.app.locals.accountInfo[req.app.locals.currentAcc]["accountBalance"] += add;

        fs.writeFile("accounts.json", JSON.stringify(req.app.locals.accountInfo), function(err) {
            console.log("wrote successfully");
            
        });

        res.render("account", {
            pagetype: 'ACCOUNT MANAGER',
            username: req.app.locals.currentUser,
            accounts: req.app.locals.accountRes,
            errors: '$' + add.toFixed(2) + ' deposited to account ' + req.app.locals.currentAcc
        });
    }
});

module.exports = router;