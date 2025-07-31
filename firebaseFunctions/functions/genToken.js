const google = require("googleapis");

function getAccessToken() {
    const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
    const SCOPES = [MESSAGING_SCOPE];
    return new Promise(function(resolve, reject) {
        const key = require('./fcm.json');
        const jwtClient = new google.google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        );
        jwtClient.authorize(function(err, tokens) {
            if (err) {
                console.log(err)
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}
getAccessToken().then(console.log);