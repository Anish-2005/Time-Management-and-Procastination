import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBnAZWGMiC8hJ1YEzdrobUUy4MNto-9KWU",
  authDomain: "time-management-e03d7.firebaseapp.com",
  projectId: "time-management-e03d7",
  storageBucket: "time-management-e03d7.appspot.com",
  messagingSenderId: "897082819655",
  appId: "1:897082819655:web:9349d9921b776be19e9d62",
  measurementId: "G-YHH0V3901Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signOut };