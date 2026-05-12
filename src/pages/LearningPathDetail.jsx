import { useParams, Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import {
  getLearningPath,
  getPathProgress,
  savePathProgress,
  isPathUnlocked,
  getNextUnlockableEntity,
} from '../data/learning-paths'
import { getEntity } from '../services/retrieval'

export default function LearningPathDetail() {
  const { pathId } = useParams()
  const navigate = useNavigate()

  const path = useMemo(() => getLearningPath(pathId), [pathId])
  const progress = useMemo(() => getPathProgress(pathId), [pathId])
  const unlocked = useMemo(() => isPathUnlocked(pathId), [pathId])

  const totalLevels = path?.levels.length || 0
  const completedLevels = progress.completedLevels.length
  const progressPercent = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0

  const startLevel = (levelId) => {
    // Mark level as in-progress
    const newProgress = {
      ...progress,
      currentLevel: levelId,
      lastAccessed: new Date().toISOString(),
    }
    savePathProgress(pathId, newProgress)

    // Navigate to first entity in the level
    const level = path.levels.find(l => l.id === levelId)
    if (level && level.entities.length > 0) {
      navigate(`/entity/${level.entities[0]}`)
    }
  }

  const completeLevel = (levelId) => {
    if (!progress.completedLevels.includes(levelId)) {
      const newCompleted = [...progress.completedLevels, levelId]
      const level = path.levels.find(l => l.id === levelId)
      const bonusPoints = path.rewards?.bonusPoints || 0
      const levelBonus = Math.round(bonusPoints / totalLevels)

      const newProgress = {
        ...progress,
        completedLevels: newCompleted,
        currentLevel: null,
        totalScore: progress.totalScore + levelBonus,
        lastCompletedAt: new Date().toISOString(),
      }
      savePathProgress(pathId, newProgress)

      // Award gamification points
      const totalPoints = parseInt(localStorage.getItem('gamification-points') || '0')
      localStorage.setItem('gamification-points', (totalPoints + levelBonus).toString())

      // Check if path completed
      if (newCompleted.length === totalLevels) {
        alert(`🎉 Chúc mừng! Bạn đã hoàn thành lộ trình "${path.title}"\nNhận được ${bonusPoints} điểm thưởng!`)
      } else {
        alert(`✅ Hoàn thành cấp độ! +${levelBonus} điểm`)
      }

      // Force re-render
      window.location.reload()
    }
  }

  const isLevelCompleted = (levelId) => progress.completedLevels.includes(levelId)
  const isLevelAccessible = (levelId, levelIndex) => {
    // First level always accessible if path unlocked
    if (levelIndex === 0) return unlocked
    // Other levels require previous level completed
    const prevLevel = path.levels[levelIndex - 1]
    return unlocked && isLevelCompleted(prevLevel.id)
  }

  if (!path) {
    return (
      <div className="page-container min-h-screen flex items-center justify-center">
        <div className="card-ancient p-6 text-center">
          <p className="text-lg" style={{ color: 'var(--clr-ink)' }}>Không tìm thấy lộ trình học tập</p>
          <Link to="/learning-paths" className="btn-primary mt-4 text-sm inline-block">
            Xem các lộ trình khác
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container min-h-screen">
      <div className="interactive-surface">
        <header className="border-b glass-panel">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <Link
              to="/learning-paths"
              className="flex items-center gap-2 transition hover:opacity-80"
              style={{ color: 'var(--clr-gold)' }}
            >
              <span>←</span>
              <span className="text-sm font-semibold">Quay danh sách lộ trình</span>
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">{path.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="display text-2xl font-bold" style={{ color: 'var(--clr-ink)' }}>
                  {path.title}
                </h1>
                <span
                  className="px-2 py-0.5 text-[10px] uppercase"
                  style={{
                    background: 'rgba(184,134,11,0.2)',
                    color: 'var(--clr-gold)',
                    borderRadius: '2px',
                  }}
                >
                  {path.difficulty}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                {path.description}
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="card-ancient p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold" style={{ color: 'var(--clr-ink)' }}>Tiến độ tổng thể</h3>
              <span className="text-lg font-bold" style={{ color: 'var(--clr-gold)' }}>
                {progressPercent}% ({completedLevels}/{totalLevels})
              </span>
            </div>
            <div className="h-3 rounded-full" style={{ background: 'rgba(184,134,11,0.15)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, var(--clr-jade), var(--clr-gold))',
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-xs">
              <span style={{ color: 'var(--clr-ink-soft)' }}>
                ⏱️ {path.estimatedHours} giờ học
              </span>
              <span style={{ color: 'var(--clr-vermillion)' }}>
                🏆 {path.rewards?.badge}
              </span>
            </div>
          </div>

          {/* Locked warning */}
          {!unlocked && (
            <div className="mb-6 p-4 rounded-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-sm" style={{ color: 'var(--clr-ink-soft)' }}>
                🔒 Lộ trình này đã bị khóa. Hoàn thành{' '}
                <Link
                  to={`/learning-path/${path.prerequisites[0]}`}
                  className="font-semibold"
                  style={{ color: 'var(--clr-gold)' }}
                >
                  {getLearningPath(path.prerequisites[0])?.title}
                </Link>{' '}
                để mở khóa.
              </p>
            </div>
          )}

          {/* Levels */}
          <div className="space-y-4">
            {path.levels.map((level, index) => {
              const completed = isLevelCompleted(level.id)
              const accessible = isLevelAccessible(level.id, index)
              const levelProgress = completed ? 100 : 0

              return (
                <div
                  key={level.id}
                  className="card-ancient overflow-hidden"
                  style={{
                    borderLeft: completed
                      ? '3px solid var(--clr-jade)'
                      : accessible
                      ? '3px solid var(--clr-gold)'
                      : '3px solid rgba(156,163,175,0.3)',
                    opacity: accessible ? 1 : 0.7,
                  }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">
                            {completed ? '✅' : accessible ? '📚' : '🔒'}
                          </span>
                          <h3 className="display text-lg font-bold" style={{ color: 'var(--clr-ink)' }}>
                            {level.title}
                          </h3>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                          {level.description}
                        </p>
                      </div>
                      {completed && (
                        <span
                          className="px-2 py-1 text-xs font-semibold"
                          style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}
                        >
                          ĐÃ HOÀN THÀNH
                        </span>
                      )}
                    </div>

                    {/* Entities in this level */}
                    <div className="mb-4 space-y-2">
                      {level.entities.map(entityId => {
                        const entity = getEntity(entityId)
                        if (!entity) return null
                        return (
                          <Link
                            key={entityId}
                            to={`/entity/${entityId}`}
                            className="flex items-center gap-3 p-2 rounded-sm transition hover:bg-opacity-80"
                            style={{ background: 'rgba(245,239,224,0.5)' }}
                          >
                            <span>{entity.type === 'person' ? '👤' : '⚔️'}</span>
                            <div>
                              <p className="font-semibold text-sm" style={{ color: 'var(--clr-ink)' }}>
                                {entity.name}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>{entity.period}</p>
                            </div>
                            {completed && (
                              <span className="ml-auto text-xs" style={{ color: 'var(--clr-jade)' }}>
                                ✓
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--clr-ink-soft)' }}>
                        {level.entities.length} nhân vật/sự kiện • Điểm yêu cầu: {level.requiredScore}%
                      </span>
                      {accessible && (
                        <button
                          onClick={() =>
                            completed
                              ? completeLevel(level.id)
                              : startLevel(level.id)
                          }
                          className={`btn-primary text-sm ${completed ? 'bg-green-600 hover:bg-green-700' : ''}`}
                          style={{
                            background: completed ? 'var(--clr-jade)' : undefined,
                            opacity: completed ? 0.8 : 1,
                          }}
                        >
                          {completed ? 'Đã hoàn thành ✓' : 'Bắt đầu'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Completion message */}
          {completedLevels === totalLevels && (
            <div className="mt-6 p-6 rounded-sm text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid var(--clr-jade)' }}>
              <p className="text-2xl mb-2">🏆</p>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--clr-ink)' }}>
                Chúc mừng!
              </h3>
              <p className="mb-4" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                Bạn đã hoàn thành toàn bộ lộ trình "{path.title}"
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span style={{ color: 'var(--clr-gold)' }}>
                  ⭐ {path.rewards?.bonusPoints} điểm thưởng
                </span>
                <span style={{ color: 'var(--clr-vermillion)' }}>
                  🏅 {path.rewards?.badge}
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
