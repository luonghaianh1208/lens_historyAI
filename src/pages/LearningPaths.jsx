import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAllLearningPaths } from '../data/learning-paths'
import LearningPathCard from '../components/LearningPathCard'
import GlobalHeader from '../components/GlobalHeader'

export default function LearningPaths() {
  const paths = useMemo(() => getAllLearningPaths(), [])

  return (
    <div className="page-container min-h-screen">
      <div className="interactive-surface">
        <GlobalHeader />

        <main className="max-w-6xl mx-auto px-6 py-10">
          <div className="mb-10">
            <div className="divider-ancient mb-4">
              <span className="display text-sm px-4" style={{ color: 'var(--clr-gold)' }}>
                Học tập có hệ thống
              </span>
            </div>
            <h1 className="display text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--clr-ink)' }}>
              Hành trình học lịch sử
            </h1>
            <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
              Chọn một lộ trình học tập phù hợp với mục tiêu của bạn. Mỗi lộ trình được chia thành các cấp độ nhỏ,
              hoàn thành quiz để mở khóa và nhận điểm thưởng.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {paths.map(path => (
              <LearningPathCard key={path.id} pathId={path.id} />
            ))}
          </div>

          <div className="mt-10 p-5 rounded-sm" style={{ background: 'rgba(184,134,11,0.08)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--clr-ink)' }}>
              💡 Mẹo học tập hiệu quả
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
              <li>• Đọc kỹ thông tin nhân vật/sự kiện trước khi làm quiz</li>
              <li>• Sử dụng flashcards để ghi nhớ nhanh</li>
              <li>• Hoàn thành tất cả các cấp độ trong một lộ trình để nhận chứng nhận</li>
              <li>• Theo dõi tiến độ trong trang Profile của bạn</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}
