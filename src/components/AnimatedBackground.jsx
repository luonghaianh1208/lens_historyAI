import { useMemo } from 'react'

function hashSeed(input) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash) || 1
}

function createRandom(seed) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function buildParticles(seedKey, count, builder) {
  const seed = hashSeed(seedKey)
  const random = createRandom(seed)
  return Array.from({ length: count }, (_, index) => builder(random, index))
}

export default function AnimatedBackground({
  entityId,
  mode = 'full',
}) {
  const isQuiet = mode === 'quiet'
  const petalCount = isQuiet ? 0 : 14
  const dustCount = isQuiet ? 0 : 16
  const ringSizes = isQuiet ? [420, 680] : [320, 480, 640, 800, 960]
  const rotatingRingSizes = isQuiet ? [540] : [400, 600, 750]

  const petals = useMemo(
    () => buildParticles(`${entityId}-petals-${mode}`, petalCount, (random, index) => ({
      id: `petal-${index}`,
      color: ['petal-pink', 'petal-white', 'petal-gold'][index % 3],
      style: {
        left: `${random() * 100}%`,
        '--duration': `${8 + random() * 10}s`,
        '--delay': `-${random() * 12}s`,
        '--drift': `${(random() - 0.5) * 90}px`,
        '--spin': `${(random() - 0.5) * 540}deg`,
      },
    })),
    [entityId, mode, petalCount],
  )

  const dust = useMemo(
    () => buildParticles(`${entityId}-dust-${mode}`, dustCount, (random, index) => ({
      id: `dust-${index}`,
      style: {
        width: `${2 + random() * 3.5}px`,
        height: `${2 + random() * 3.5}px`,
        left: `${random() * 100}%`,
        bottom: `${random() * 80}%`,
        '--duration': `${6 + random() * 8}s`,
        '--delay': `-${random() * 10}s`,
        '--rise': `${-(50 + random() * 90)}px`,
        '--drift': `${(random() - 0.5) * 70}px`,
        '--max-opacity': 0.25 + random() * 0.35,
      },
    })),
    [entityId, mode, dustCount],
  )

  return (
    <>
      <div className={`dongson-bg ${isQuiet ? 'dongson-bg-quiet' : ''}`} aria-hidden="true">
        {ringSizes.map((size, index) => (
          <div
            key={size}
            className="dongson-ring"
            style={{
              width: size,
              height: size,
              '--pulse-dur': `${isQuiet ? 8 : 4 + index * 1.5}s`,
              '--pulse-delay': `${index * 0.7}s`,
            }}
          />
        ))}
        {rotatingRingSizes.map((size, index) => (
          <div
            key={`rotate-${size}`}
            className="dongson-ring-rotate"
            style={{
              width: size,
              height: size,
              '--rotate-dur': `${isQuiet ? 120 : 60 + index * 30}s`,
              animationDirection: index % 2 === 0 ? 'normal' : 'reverse',
            }}
          />
        ))}
      </div>

      {!isQuiet && (
        <div className="cloud-layer" aria-hidden="true">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
        </div>
      )}

      {!isQuiet && (
        <div className="petal-container" aria-hidden="true">
          {petals.map((petal) => (
            <div
              key={petal.id}
              className={`petal ${petal.color}`}
              style={petal.style}
            />
          ))}
        </div>
      )}

      {!isQuiet && (
        <div className="dust-container" aria-hidden="true">
          {dust.map((particle) => (
            <div
              key={particle.id}
              className="dust-particle"
              style={particle.style}
            />
          ))}
        </div>
      )}
    </>
  )
}
