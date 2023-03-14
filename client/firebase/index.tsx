// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  // apiKey: process.env.API_KEY,
  // authDomain: process.env.AUTH_DOMAIN,
  // projectId: process.env.PROJECT_ID,
  // storageBucket: process.env.STORAGE_BUCKET,
  // messagingSenderId: process.env.MESSAGING_SENDER_ID,
  // appId: process.env.APP_ID,
  apiKey: 'AIzaSyDzqthYDmYu0EY5tCHdUl6VrckSRsQC2ho',
  authDomain: 'do-an-tot-nghiep-16a34.firebaseapp.com',
  projectId: 'do-an-tot-nghiep-16a34',
  storageBucket: 'do-an-tot-nghiep-16a34.appspot.com',
  messagingSenderId: '1042699935039',
  appId: '1:1042699935039:web:2b44b64178b09faf1b478a',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app)
