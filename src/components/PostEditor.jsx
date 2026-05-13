import { useState, useRef } from 'react'

const MAX_IMAGES = 5
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function PostEditor({ onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('discussion')
  const [tagsInput, setTagsInput] = useState('')
  const [images, setImages] = useState([]) // File[]
  const [previews, setPreviews] = useState([]) // string[]
  const [imageError, setImageError] = useState('')
  const fileRef = useRef(null)

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    setImageError('')

    const totalCount = images.length + files.length
    if (totalCount > MAX_IMAGES) {
      setImageError(`Tối đa ${MAX_IMAGES} ảnh`)
      return
    }

    for (const f of files) {
      if (f.size > MAX_SIZE) {
        setImageError(`"${f.name}" vượt quá 10MB`)
        return
      }
      if (!f.type.startsWith('image/')) {
        setImageError(`"${f.name}" không phải ảnh`)
        return
      }
    }

    setImages(prev => [...prev, ...files])
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews(prev => [...prev, ev.target.result])
      reader.readAsDataURL(f)
    })
  }

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    onSubmit({ title, content, category, tags, images })
  }

  return (
    <form className="post-editor card-ancient" onSubmit={handleSubmit}>
      <h2 className="display post-editor-title">Viết bài mới</h2>

      <div className="post-editor-field">
        <label>Tiêu đề *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Tiêu đề bài viết..."
          required
          maxLength={200}
        />
      </div>

      <div className="post-editor-field">
        <label>Thể loại</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="discussion">Thảo luận</option>
          <option value="article">Bài viết</option>
          <option value="question">Câu hỏi</option>
        </select>
      </div>

      <div className="post-editor-field">
        <label>Nội dung *</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Chia sẻ suy nghĩ của bạn về lịch sử..."
          required
          rows={8}
        />
      </div>

      <div className="post-editor-field">
        <label>Tags (cách nhau bởi dấu phẩy)</label>
        <input
          type="text"
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="triều Lý, Lý Thường Kiệt, chiến tranh"
        />
      </div>

      {/* Image Upload */}
      <div className="post-editor-field">
        <label>Hình ảnh (tối đa {MAX_IMAGES} ảnh, mỗi ảnh ≤ 10MB)</label>
        <input
          type="file"
          ref={fileRef}
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="btn-seal-ghost btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={images.length >= MAX_IMAGES}
        >
          📷 Chọn ảnh ({images.length}/{MAX_IMAGES})
        </button>
        {imageError && <p className="post-editor-error">{imageError}</p>}
        {previews.length > 0 && (
          <div className="post-editor-previews">
            {previews.map((src, i) => (
              <div key={i} className="post-editor-preview">
                <img src={src} alt={`Preview ${i + 1}`} />
                <button type="button" onClick={() => removeImage(i)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="post-editor-actions">
        <button type="submit" className="btn-seal" disabled={loading || !title.trim() || !content.trim()}>
          {loading ? 'Đang gửi...' : '📜 Đăng bài'}
        </button>
        <button type="button" className="btn-seal-ghost" onClick={onCancel}>
          Hủy
        </button>
      </div>

      <p className="post-editor-note">
        ℹ Bài viết sẽ được duyệt bởi quản trị viên trước khi hiển thị.
      </p>
    </form>
  )
}
