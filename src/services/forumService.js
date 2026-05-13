import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, serverTimestamp,
  increment, arrayUnion, arrayRemove
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

const POSTS_PER_PAGE = 12
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

/* ─── Posts ─── */

export async function createPost({ title, content, category, tags, images, author }) {
  const imageUrls = await uploadImages(images, author.uid)

  const postData = {
    authorId: author.uid,
    authorName: author.displayName || 'Ẩn danh',
    authorAvatar: author.avatar || '',
    title,
    content,
    images: imageUrls,
    category: category || 'discussion',
    tags: tags || [],
    likes: 0,
    likedBy: [],
    commentCount: 0,
    status: 'pending', // pre-moderation: pending → approved / rejected
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'posts'), postData)
  return docRef.id
}

export async function getPost(postId) {
  const snap = await getDoc(doc(db, 'posts', postId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function getPosts({ categoryFilter, status = 'approved', lastDoc, pageSize = POSTS_PER_PAGE } = {}) {
  let q = query(
    collection(db, 'posts'),
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  )

  if (lastDoc) {
    q = query(
      collection(db, 'posts'),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(pageSize)
    )
  }

  const snap = await getDocs(q)
  const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }))

  if (categoryFilter && categoryFilter !== 'all') {
    return posts.filter(p => p.category === categoryFilter)
  }
  return posts
}

export async function getUserPosts(uid) {
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function toggleLikePost(postId, uid) {
  const postRef = doc(db, 'posts', postId)
  const snap = await getDoc(postRef)
  if (!snap.exists()) return

  const likedBy = snap.data().likedBy || []
  if (likedBy.includes(uid)) {
    await updateDoc(postRef, {
      likes: increment(-1),
      likedBy: arrayRemove(uid)
    })
    return false
  } else {
    await updateDoc(postRef, {
      likes: increment(1),
      likedBy: arrayUnion(uid)
    })
    return true
  }
}

export async function updatePostStatus(postId, status) {
  await updateDoc(doc(db, 'posts', postId), { status, updatedAt: serverTimestamp() })
}

export async function deletePost(postId) {
  await deleteDoc(doc(db, 'posts', postId))
}

/* ─── Comments ─── */

export async function addComment(postId, { content, author }) {
  const commentData = {
    authorId: author.uid,
    authorName: author.displayName || 'Ẩn danh',
    authorAvatar: author.avatar || '',
    content,
    likes: 0,
    likedBy: [],
    status: 'active',
    createdAt: serverTimestamp()
  }

  await addDoc(collection(db, 'posts', postId, 'comments'), commentData)
  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) })
}

export async function getComments(postId) {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function deleteComment(postId, commentId) {
  await deleteDoc(doc(db, 'posts', postId, 'comments', commentId))
  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(-1) })
}

/* ─── Images ─── */

async function uploadImages(files, uid) {
  if (!files || files.length === 0) return []

  const urls = []
  for (const file of files) {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`Ảnh "${file.name}" vượt quá 10MB`)
    }
    const fileName = `${Date.now()}_${file.name}`
    const storageRef = ref(storage, `forum/${uid}/${fileName}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    urls.push(url)
  }
  return urls
}

/* ─── Admin: Users ─── */

export async function getAllUsers() {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }))
}

export async function banUser(uid, banned = true) {
  await updateDoc(doc(db, 'users', uid), { isBanned: banned })
}

export async function getPendingPosts() {
  const q = query(
    collection(db, 'posts'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
