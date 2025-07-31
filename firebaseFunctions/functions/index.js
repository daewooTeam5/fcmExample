const functions = require('firebase-functions');
const admin = require('firebase-admin');
const google  = require('googleapis');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'fcmexample-cdf89';
const HOST = 'fcm.googleapis.com';
const PATH = '/v1/projects/' + PROJECT_ID + '/messages:send';
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];

admin.initializeApp();

function getAccessToken() {
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

exports.sendFcm = functions.https.onRequest(async (req, res) => {
    const { topic, message } = req.body;

    if (!topic || !message) {
        res.status(400).send('Missing "topic" or "message" in request body.');
        return;
    }

    try {
        const accessToken = await getAccessToken();
        const messageData = {
            message: {
                topic: topic,
                notification: {
                    title: 'New Message',
                    body: message,
                },
            },
        };

        const options = {
            hostname: HOST,
            path: PATH,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
            },
        };

        const request = require('https').request(options, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                res.status(200).send(data);
            });
        });

        request.on('error', (err) => {
            console.error('FCM request error:', err);
            res.status(500).send('FCM request failed.');
        });

        request.write(JSON.stringify(messageData));
        request.end();
    } catch (error) {
        console.error('Error sending FCM message:', error);
        res.status(500).send('Error sending FCM message.');
    }
});

exports.sendFcmToToken = functions.https.onRequest(async (req, res) => {
    const { token, message } = req.body;

    if (!token || !message) {
        res.status(400).send('Missing "token" or "message" in request body.');
        return;
    }

    try {
        const accessToken = await getAccessToken();
        const messageData = {
            message: {
                token: token,
                notification: {
                    title: 'New Message',
                    body: message,
                },
            },
        };

        const options = {
            hostname: HOST,
            path: PATH,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
            },
        };

        const request = require('https').request(options, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                res.status(200).send(data);
            });
        });

        request.on('error', (err) => {
            console.error('FCM request error:', err);
            res.status(500).send('FCM request failed.');
        });

        request.write(JSON.stringify(messageData));
        request.end();
    } catch (error) {
        console.error('Error sending FCM message:', error);
        res.status(500).send('Error sending FCM message.');
    }
});