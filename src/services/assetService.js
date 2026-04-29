export function getBackgroundUrl(entityId) {
  const known = [
    'nguyen-trai', 'le-loi', 'tran-hung-dao', 'ly-thuong-kiet',
    'nguyen-hue', 'ho-chi-minh', 'khoi-nghia-lam-son',
    'chien-thang-bach-dang', 'chien-tranh-ly-tong'
  ]
  const id = known.includes(entityId) ? entityId : 'default'
  return `/assets/backgrounds/${id}.webp`
}

export function getCharacterUrl(entityId) {
  const known = [
    'nguyen-trai', 'le-loi', 'tran-hung-dao',
    'ly-thuong-kiet', 'nguyen-hue', 'ho-chi-minh'
  ]
  const id = known.includes(entityId) ? entityId : 'default'
  return `/assets/characters/${id}.webp`
}

export function getBgStyle(entityId) {
  const url = getBackgroundUrl(entityId)
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}

export function getFallbackGradient(entityId) {
  const gradients = {
    'nguyen-trai':    'linear-gradient(135deg, #2c1810 0%, #8b4513 50%, #d4a843 100%)',
    'le-loi':         'linear-gradient(135deg, #1a3a1a 0%, #2d5a27 50%, #8fbc8f 100%)',
    'tran-hung-dao':  'linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #4682b4 100%)',
    'ly-thuong-kiet': 'linear-gradient(135deg, #2d1b00 0%, #8b6914 50%, #ffd700 100%)',
    'nguyen-hue':     'linear-gradient(135deg, #0d0d1a 0%, #1a1a3e 50%, #6666cc 100%)',
    'ho-chi-minh':    'linear-gradient(135deg, #1a2f1a 0%, #2d5a3f 50%, #90b090 100%)',
    'khoi-nghia-lam-son': 'linear-gradient(135deg, #2c1810 0%, #5c3a1e 50%, #b8860b 100%)',
    'default':        'linear-gradient(135deg, #2c1810 0%, #5c3a1e 50%, #b8860b 100%)',
  }
  return gradients[entityId] || gradients.default
}