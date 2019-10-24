const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const passport = require('passport');

var BearerStrategy = require("passport-azure-ad").BearerStrategy;

// Modify the below three lines to suit your environment
var tenantID = "<tenantid>";
var clientID = "<appid>";
var appIdURI = "https://funcapi.<tenantname>.onmicrosoft.com";

var options = {
    identityMetadata: "https://login.microsoftonline.com/" + tenantID + "/v2.0/.well-known/openid-configuration",
    clientID: clientID,
    issuer: "https://sts.windows.net/" + tenantID + "/",
    audience: appIdURI,
    loggingLevel: "info",
    passReqToCallback: false
};

var bearerStrategy = new BearerStrategy(options, function (token, done) {
    done(null, {}, token);
});

const app = express();

app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ "extended": true }));
app.use(passport.initialize());
passport.use(bearerStrategy);

// This is where your API methods are exposed
app.get(
    "/api",
    passport.authenticate("oauth-bearer", { session: false }),
    function (req, res) {
        var claims = req.authInfo;
        console.log("Validated claims: ", JSON.stringify(claims));
        console.log("body text: ", JSON.stringify(req.body));
        res.status(200).json(claims);
    }
);

module.exports = createHandler(app);
