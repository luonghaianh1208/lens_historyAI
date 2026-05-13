import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loginEmail = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError(mapFirebaseError(err.code))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const registerEmail = async (email, password, displayName) => {
    setLoading(true)
    setError(null)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName })
    } catch (err) {
      setError(mapFirebaseError(err.code))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loginGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(mapFirebaseError(err.code))
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return { loginEmail, registerEmail, loginGoogle, logout, loading, error, setError }
}

function mapFirebaseError(code) {
  const map = {
    'auth/email-already-in-use': 'Email này đã được sử dụng',
    'auth/invalid-email': 'Email không hợp lệ',
    'auth/weak-password': 'Mật khẩu phải có ít nhất 6 ký tự',
    'auth/user-not-found': 'Không tìm thấy tài khoản',
    'auth/wrong-password': 'Sai mật khẩu',
    'auth/invalid-credential': 'Thông tin đăng nhập không hợp lệ',
    'auth/too-many-requests': 'Quá nhiều lần thử, vui lòng thử lại sau',
    'auth/popup-closed-by-user': 'Đã đóng cửa sổ đăng nhập',
  }
  return map[code] || 'Đã xảy ra lỗi, vui lòng thử lại'
}
