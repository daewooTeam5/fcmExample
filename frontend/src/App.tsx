import {ChangeEvent, useCallback, useEffect, useState} from 'react'
import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';
import "firebase/compat/database"

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
const messaging = firebase.messaging();

function App() {
    const [value, setValue] = useState<string>("")
    const onChangeValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }, [value])

    const onClickSendButton = useCallback(() => {
        const sendData = {
            message: value,
            topic: "news",
        };
        fetch("https://us-central1-fcmexample-cdf89.cloudfunctions.net/sendFcm", {
            method: "POST",
            body: JSON.stringify(sendData),
            headers:{
                "Content-Type": "application/json",
            }
        }).then(r => alert("전송 성공"))
            .catch(e => alert(e.toString()));

    }, [value]);
    useEffect(() => {
        // 포그라운드 메시지 수신
        messaging.onMessage((payload) => {
            console.log('Message received. ', payload);

            // 커스텀 알림 띄우기 (브라우저 알림 API)
            if (Notification.permission === 'granted') {
                const {title, body} = payload.notification;
                new Notification(title, {body});
            }
        });
    }, []);
    return (
        <>
            <input value={value} onChange={onChangeValue}/>
            <button onClick={onClickSendButton}>전송</button>
        </>
    )
}

export default App
