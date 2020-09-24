const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const passport = require('passport');

var BearerStrategy = require("passport-azure-ad").BearerStrategy;

// Modify the below three lines to suit your environment
var tenantID = "cbaf2168-de14-4c72-9d88-f5f05366dbef";
var clientID = "e767d418-b80b-4568-9754-557f40697fc5";
var appIdURI = "e767d418-b80b-4568-9754-557f40697fc5"; //"https://funcapi.<tenantname>.onmicrosoft.com";

var options = {
    identityMetadata: "https://login.microsoftonline.com/" + tenantID + "/v2.0/.well-known/openid-configuration",
    clientID: clientID,
    validateIssuer: false,
    loggingLevel: "info",
    passReqToCallback: false
};

const bearerStrategy = new BearerStrategy(options, (token, done) => {
    // Send user info using the second argument
    done(null, {}, token);
});

const app = express();

app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ "extended": true }));
app.use(passport.initialize());
passport.use(bearerStrategy);

// Enable CORS (for testing only)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// This is where your API methods are exposed
app.get("/api",
    passport.authenticate("oauth-bearer", { session: false }),
    function (req, res) {
        var claims = req.authInfo;
        console.log("Validated claims: ", JSON.stringify(claims));
        console.log("body text: ", JSON.stringify(req.body));
        res.status(200).json(claims);
    }
);

module.exports = createHandler(app);
