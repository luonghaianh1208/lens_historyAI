// Netlify serverless function: Admin user management (delete user, change role)
// Requires FIREBASE_SERVICE_ACCOUNT env var with JSON service account key
import admin from 'firebase-admin'

let app
function getAdmin() {
  if (app) return app
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
  return app
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { action, uid, idToken } = await req.json()

    if (!uid || !idToken || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    getAdmin()

    // Verify the caller is an admin by checking their token
    const decoded = await admin.auth().verifyIdToken(idToken)
    const callerDoc = await admin.firestore().doc(`users/${decoded.uid}`).get()
    if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized: admin only' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Prevent self-deletion
    if (action === 'delete' && decoded.uid === uid) {
      return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (action === 'delete') {
      // Delete Firebase Auth account
      await admin.auth().deleteUser(uid)
      // Delete Firestore profile
      await admin.firestore().doc(`users/${uid}`).delete()

      return new Response(JSON.stringify({ success: true, message: 'User deleted' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Admin user management error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = {
  path: '/api/admin-users'
}
