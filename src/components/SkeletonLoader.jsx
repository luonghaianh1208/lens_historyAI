export function SkeletonCard() {
  return (
    <div className="card-ancient p-4 animate-pulse">
      <div className="h-5 w-5 mb-3 rounded" style={{ background: 'rgba(184,134,11,0.15)' }} />
      <div className="h-4 w-3/4 mb-2 rounded" style={{ background: 'rgba(184,134,11,0.15)' }} />
      <div className="h-3 w-1/2 rounded" style={{ background: 'rgba(184,134,11,0.1)' }} />
      <div className="flex gap-1 mt-3">
        <div className="h-5 w-14 rounded" style={{ background: 'rgba(184,134,11,0.1)' }} />
        <div className="h-5 w-12 rounded" style={{ background: 'rgba(184,134,11,0.1)' }} />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded"
          style={{
            background: 'rgba(184,134,11,0.12)',
            width: i === lines - 1 ? '60%' : '100%',
          }}
        />
      ))}
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="animate-pulse">
      <div className="h-96 w-full rounded-sm" style={{ background: 'rgba(184,134,11,0.1)' }} />
      <div className="max-w-5xl mx-auto px-6 -mt-16">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-ancient p-5">
              <div className="h-3 w-20 mb-3 rounded" style={{ background: 'rgba(184,134,11,0.15)' }} />
              <div className="h-4 w-full rounded" style={{ background: 'rgba(184,134,11,0.12)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonChat() {
  return (
    <div className="space-y-4 animate-pulse max-w-3xl mx-auto px-4 py-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className={i % 2 === 0 ? 'flex justify-end' : 'flex justify-start'}>
          <div className="max-w-2xl px-4 py-3 rounded-sm" style={{ background: 'rgba(184,134,11,0.08)' }}>
            <div className="h-3 w-16 mb-2 rounded" style={{ background: 'rgba(184,134,11,0.12)' }} />
            <div className="h-4 w-48 rounded" style={{ background: 'rgba(184,134,11,0.1)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonQuiz() {
  return (
    <div className="card-ancient p-8 text-center animate-pulse">
      <div className="text-4xl mb-4">🤖</div>
      <div className="h-5 w-48 mx-auto mb-6 rounded" style={{ background: 'rgba(184,134,11,0.15)' }} />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 w-full rounded-sm" style={{ background: 'rgba(184,134,11,0.1)' }} />
        ))}
      </div>
    </div>
  )
}
