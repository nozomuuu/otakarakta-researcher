import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBhAjrTs7T7r7N0NsDRwJ2BPsosKS0REc",
  authDomain: "otakarakta-researcher.firebaseapp.com",
  projectId: "otakarakta-researcher",
  storageBucket: "otakarakta-researcher.appspot.com",
  messagingSenderId: "227151276637",
  appId: "1:227151276637:web:8ec07d8119cf03bb457c",
  measurementId: "G-3L4NSKL5BE",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };

