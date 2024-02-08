// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, getAuth } from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBu3FH6wud5O5GJVLudLxf8opb1PsZDumc",
    authDomain: "ctruh-auth.firebaseapp.com",
    projectId: "ctruh-auth",
    storageBucket: "ctruh-auth.appspot.com",
    messagingSenderId: "190556255900",
    appId: "1:190556255900:web:54b4ccc85ea57c1bd95f59",
    measurementId: "G-PSE72D2VWW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
export default firebase;

export { auth, facebookProvider, githubProvider, provider };
