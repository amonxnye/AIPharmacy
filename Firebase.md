// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyDlU_a7WHQol8yaXH-BXbpZbm8SssuvJK0",
authDomain: "aipharamcy.firebaseapp.com",
projectId: "aipharamcy",
storageBucket: "aipharamcy.firebasestorage.app",
messagingSenderId: "983016840228",
appId: "1:983016840228:web:611029ab98d90e90694cb1",
measurementId: "G-R3KXDGR7TG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
