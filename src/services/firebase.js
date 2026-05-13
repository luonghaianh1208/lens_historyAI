import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAfq4NVTU6C5qspSKVU584Leg71f_6crh8",
  authDomain: "historylensai-f7b7a.firebaseapp.com",
  projectId: "historylensai-f7b7a",
  storageBucket: "historylensai-f7b7a.firebasestorage.app",
  messagingSenderId: "171057373500",
  appId: "1:171057373500:web:47a1e95ab74845551bbe39",
  measurementId: "G-34M38DP949"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

export default app
