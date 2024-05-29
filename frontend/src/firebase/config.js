import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // apiKey: process.env.REACT_APP_API,
  // authDomain: process.env.REACT_APP_AUTHDOMAIN,
  // projectId: process.env.REACT_APP_PROJECTID,
  // storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  // messagingSenderId: process.env.REACT_APP_SENDERID,
  // appId: process.env.REACT_APP_APPID,
  apiKey: "AIzaSyA6lcjzvPzZdujGf3uMoSb3IdK1b9MTex8",
  authDomain: "mern-lms-1d3ba.firebaseapp.com",
  projectId: "mern-lms-1d3ba",
  storageBucket: "mern-lms-1d3ba.appspot.com",
  messagingSenderId: "467699755545",
  appId: "1:467699755545:web:4a997017443be1b36f5888",
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

// const firebaseConfig = {
//   apiKey: "AIzaSyA6lcjzvPzZdujGf3uMoSb3IdK1b9MTex8",
//   authDomain: "mern-lms-1d3ba.firebaseapp.com",
//   projectId: "mern-lms-1d3ba",
//   storageBucket: "mern-lms-1d3ba.appspot.com",
//   messagingSenderId: "467699755545",
//   appId: "1:467699755545:web:4a997017443be1b36f5888"
// };
