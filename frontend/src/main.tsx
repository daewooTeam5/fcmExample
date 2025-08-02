import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import firebase from 'firebase/compat/app';
import "firebase/compat/messaging"
import "firebase/compat/database"
function requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
        }
    });
}
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
firebase.initializeApp(firebaseConfig);
requestPermission()
const messaging = firebase.messaging();
const database = firebase.database();
messaging.getToken({vapidKey: import.meta.env.VITE_VAPID_KEY}).then(r=>{
    const uuid = crypto.randomUUID();
    const usersRef = database.ref("web/users");
    // 토큰 저장 (웹 fcm 은 서버쪽에서 fcm 토큰 등록하고 해야되서 중복 확인후 없을시 디비에 저장 )
    usersRef.once('value')
        .then(snapshot => {
            const users = snapshot.val();
            const tokenExists = Object.values(users || {}).some(user =>{
                console.log(user)
                return user === r
            } );

            if (tokenExists) {
                console.log("이미 등록된 토큰");
            } else {
                // 2. 없다면 새로 등록
                usersRef.child(uuid).set(r)
                    .then(() => console.log("등록 완료!"))
                    .catch(err => console.error("등록 실패 ", err));
            }
        })
        .catch(err => console.error("토큰 확인 실패 ", err));
})
createRoot(document.getElementById('root')!).render(
    <App />
)
