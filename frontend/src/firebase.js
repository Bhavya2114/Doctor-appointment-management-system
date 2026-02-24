import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAc1xTTUcXGvBfrtR-MMzGkuXfnv_CwZ_M",
  authDomain: "medlink-2114.firebaseapp.com",
  projectId: "medlink-2114",
  storageBucket: "medlink-2114.firebasestorage.app",
  messagingSenderId: "1044071093879",
  appId: "1:1044071093879:web:5b0072c3c379be42b2d872",
  measurementId: "G-ZGGFXFX2J2"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };