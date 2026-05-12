import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { getLearningPath, getPathProgress, isPathUnlocked } from '../data/learning-paths'
import { getAllEntities } from '../services/retrieval'

export default function LearningPathCard({ pathId, userProgress = {} }) {
  const path = useMemo(() => getLearningPath(pathId), [pathId])
  const progress = useMemo(() => getPathProgress(pathId), [pathId])
  const unlocked = useMemo(() => isPathUnlocked(pathId, userProgress), [pathId, userProgress])
  const entities = useMemo(() => {
    const allEntities = getAllEntities()
    const entityMap = new Map(allEntities.map(e => [e.id, e]))
    return progress.completedLevels.map(levelId => {
      const level = path.levels.find(l => l.id === levelId)
      return {
        level,
        entities: level?.entities.map(id => entityMap.get(id)).filter(Boolean) || [],
      }
    })
  }, [progress.completedLevels, path])

  if (!path) return null

  const totalLevels = path.levels.length
  const completedLevels = progress.completedLevels.length
  const progressPercent = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0

  return (
    <div className="card-ancient overflow-hidden" style={{ borderLeft: `3px solid var(--clr-gold)` }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{path.icon}</span>
            <div>
              <h3 className="display text-lg font-bold" style={{ color: 'var(--clr-ink)' }}>
                {path.title}
              </h3>
              <p className="text-xs" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                {path.description}
              </p>
            </div>
          </div>
          {path.difficulty && (
            <span
              className="px-2 py-0.5 text-[10px] uppercase tracking-wider"
              style={{
                background: 'rgba(184,134,11,0.15)',
                color: 'var(--clr-gold)',
                borderRadius: '2px',
              }}
            >
              {path.difficulty}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: 'var(--clr-ink-soft)' }}>
              Tiến độ: {completedLevels}/{totalLevels} cấp độ
            </span>
            <span className="font-semibold" style={{ color: 'var(--clr-gold)' }}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ background: 'rgba(184,134,11,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, var(--clr-gold), var(--clr-vermillion))',
              }}
            />
          </div>
        </div>

        {/* Completed levels */}
        {progress.completedLevels.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-semibold" style={{ color: 'var(--clr-ink)' }}>
              Cấp độ đã hoàn thành:
            </p>
            {progress.completedLevels.map(levelId => {
              const level = path.levels.find(l => l.id === levelId)
              if (!level) return null
              return (
                <div
                  key={levelId}
                  className="flex items-center gap-2 p-2 text-sm"
                  style={{ background: 'rgba(34,197,94,0.1)' }}
                >
                  <span style={{ color: '#22c55e' }}>✓</span>
                  <span style={{ color: 'var(--clr-ink)', fontFamily: 'var(--font-serif)' }}>
                    {level.title}
                  </span>
                  <span className="ml-auto text-xs" style={{ color: 'var(--clr-gold)' }}>
                    {level.entities.length} nhân vật
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Next available level */}
        {unlocked && completedLevels < totalLevels && (
          <div className="mb-4 p-3 rounded-sm" style={{ background: 'rgba(184,134,11,0.08)' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--clr-ink)' }}>
              Cấp độ tiếp theo:
            </p>
            {path.levels
              .filter(level => !progress.completedLevels.includes(level.id))
              .slice(0, 1)
              .map(level => (
                <div key={level.id}>
                  <p className="text-sm mb-1" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                    {level.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>
                    {level.description}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* Locked message */}
        {!unlocked && (
          <div className="mb-4 p-3 rounded-sm" style={{ background: 'rgba(156,163,175,0.1)' }}>
            <p className="text-sm" style={{ color: 'var(--clr-ink-soft)' }}>
              🔒 Cần hoàn thành{' '}
              <Link
                to={`/learning-path/${path.prerequisites[0]}`}
                className="font-semibold hover:underline"
                style={{ color: 'var(--clr-gold)' }}
              >
                {getLearningPath(path.prerequisites[0])?.title}
              </Link>{' '}
              trước khi mở khóa.
            </p>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1" style={{ color: 'var(--clr-gold)' }}>
            ⭐ {path.rewards?.bonusPoints || 0} điểm thưởng
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--clr-vermillion)' }}>
            🏆 {path.rewards?.badge}
          </span>
          {path.rewards?.certificate && (
            <span className="flex items-center gap-1" style={{ color: 'var(--clr-jade)' }}>
              📜 Chứng nhận
            </span>
          )}
        </div>
      </div>

      <div
        className="px-5 py-3 border-t"
        style={{
          borderColor: 'rgba(184,134,11,0.15)',
          background: 'linear-gradient(90deg, rgba(184,134,11,0.05) 0%, transparent 100%)',
        }}
      >
        <Link
          to={unlocked ? `/learning-path/${pathId}` : `/learning-path/${pathId}?locked=true`}
          className="btn-primary w-full text-sm disabled:opacity-50"
          style={{ opacity: unlocked ? 1 : 0.6, pointerEvents: unlocked ? 'auto' : 'none' }}
        >
          {unlocked ? 'Bắt đầu học' : 'Đã khóa'}
        </Link>
      </div>
    </div>
  )
}
