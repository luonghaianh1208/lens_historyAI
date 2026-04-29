import { useEffect, useRef } from 'react'

// Tạo cánh hoa rơi bằng JS để kiểm soát số lượng và vị trí
function createPetals(container, count = 18) {
  const colors = ['petal-pink', 'petal-white', 'petal-gold']
  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div')
    petal.className = `petal ${colors[i % colors.length]}`
    const left = Math.random() * 100
    const duration = 8 + Math.random() * 12  // 8–20s
    const delay = Math.random() * 15          // 0–15s
    const drift = (Math.random() - 0.5) * 120 // ±60px
    const spin = (Math.random() - 0.5) * 720  // ±360deg
    petal.style.cssText = `
      left: ${left}%;
      --duration: ${duration}s;
      --delay: -${delay}s;
      --drift: ${drift}px;
      --spin: ${spin}deg;
    `
    container.appendChild(petal)
  }
}

// Tạo hạt bụi vàng
function createDust(container, count = 30) {
  for (let i = 0; i < count; i++) {
    const dust = document.createElement('div')
    dust.className = 'dust-particle'
    const size = 2 + Math.random() * 4  // 2–6px
    const left = Math.random() * 100
    const bottom = Math.random() * 80
    const duration = 6 + Math.random() * 10
    const delay = Math.random() * 12
    const rise = -(60 + Math.random() * 120) + 'px'
    const drift = (Math.random() - 0.5) * 80 + 'px'
    const opacity = 0.3 + Math.random() * 0.5
    dust.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${left}%; bottom: ${bottom}%;
      --duration: ${duration}s;
      --delay: -${delay}s;
      --rise: ${rise};
      --drift: ${drift};
      --max-opacity: ${opacity};
    `
    container.appendChild(dust)
  }
}

export default function AnimatedBackground({ entityId }) {
  const petalRef = useRef(null)
  const dustRef  = useRef(null)

  useEffect(() => {
    if (petalRef.current && dustRef.current) {
      petalRef.current.innerHTML = ''
      dustRef.current.innerHTML  = ''
      createPetals(petalRef.current, 18)
      createDust(dustRef.current, 25)
    }
  }, [entityId])

  return (
    <>
      {/* Lớp 0: Hoa văn trống đồng */}
      <div className="dongson-bg" aria-hidden="true">
        {/* Vòng tròn tĩnh pulse */}
        {[320, 480, 640, 800, 960].map((size, i) => (
          <div key={size} className="dongson-ring" style={{
            width: size, height: size,
            '--pulse-dur': `${4 + i * 1.5}s`,
            '--pulse-delay': `${i * 0.8}s`,
          }} />
        ))}
        {/* Vòng tròn xoay */}
        {[400, 600, 750].map((size, i) => (
          <div key={`r${size}`} className="dongson-ring-rotate" style={{
            width: size, height: size,
            '--rotate-dur': `${60 + i * 30}s`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
          }} />
        ))}
      </div>

      {/* Lớp 1: Mây trôi */}
      <div className="cloud-layer" aria-hidden="true">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      {/* Lớp 2: Cánh hoa rơi */}
      <div ref={petalRef} className="petal-container" aria-hidden="true" />

      {/* Lớp 3: Hạt bụi vàng */}
      <div ref={dustRef} className="dust-container" aria-hidden="true" />
    </>
  )
}
