const express = require('express');
const passport = require('passport');
const auth = require('../auth.json');

const createHandler = require('azure-function-express').createHandler;

const BearerStrategy = require("passport-azure-ad").BearerStrategy;

const options = {
    identityMetadata: `https://login.microsoftonline.com/${auth.tenantID}/v2.0/.well-known/openid-configuration`,
    issuer: `https://login.microsoftonline.com/${auth.tenantID}/v2.0`,
    clientID: auth.clientID,
    audience: auth.audience,
    validateIssuer: auth.validateIssuer,
    passReqToCallback: auth.passReqToCallback,
    loggingLevel: auth.loggingLevel,
    scope: auth.scope
};

const bearerStrategy = new BearerStrategy(options, (token, done) => {
    // Send user info using the second argument
    done(null, {}, token);
});

const app = express();

app.use(require('morgan')('combined'));

app.use(require('body-parser').urlencoded({ 'extended': true }));

app.use(passport.initialize());

passport.use(bearerStrategy);

// Enable CORS (for local testing only -remove in production/deployment)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Expose and protect API endpoint
app.get('/api', passport.authenticate('oauth-bearer', { session: false }),
    (req, res) => {
        console.log('Validated claims: ', req.authInfo);

        // Service relies on the name claim.  
        res.status(200).json({
            'request-for': 'access_token',
            'requested-by': req.authInfo['name'],
            'issued-by': req.authInfo['iss'],
            'issued-for': req.authInfo['aud'],
            'scope': req.authInfo['scp']
        });
    }
);

module.exports = createHandler(app);
