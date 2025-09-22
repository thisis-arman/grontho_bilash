// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCH8XS08hEMhER18dpOXXPNCZHvsvlEaxQ",
  authDomain: "gronthobilash19.firebaseapp.com",
  projectId: "gronthobilash19",
  storageBucket: "gronthobilash19.firebasestorage.app",
  messagingSenderId: "174432605769",
  appId: "1:174432605769:web:c7cc96f3303cab7f7c1198",
  measurementId: "G-H5W4F68M4Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);