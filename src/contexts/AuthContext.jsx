import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const profileRef = doc(db, 'users', firebaseUser.uid)
        const profileSnap = await getDoc(profileRef)
        if (profileSnap.exists()) {
          setUserProfile({ uid: firebaseUser.uid, ...profileSnap.data() })
        } else {
          const newProfile = {
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL || '',
            role: 'user',
            postCount: 0,
            commentCount: 0,
            isBanned: false,
            createdAt: serverTimestamp()
          }
          await setDoc(profileRef, newProfile)
          setUserProfile({ uid: firebaseUser.uid, ...newProfile })
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const isAdmin = userProfile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
