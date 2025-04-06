// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgw0HJimMrT0fZIvG90W2pSMsiT0d66hk",
  authDomain: "flash-cards-cebc8.firebaseapp.com",
  projectId: "flash-cards-cebc8",
  storageBucket: "flash-cards-cebc8.firebasestorage.app",
  messagingSenderId: "157018091862",
  appId: "1:157018091862:web:d312f83fffed09a92ee6f7",
  measurementId: "G-JH5S6NG4CQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);