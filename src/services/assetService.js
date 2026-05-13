const ENTITY_CHARACTER_PATHS = {
  // Batch 0 — original webp characters
  'nguyen-trai': '/assets/characters/char_nguyen_trai.webp',
  'tran-hung-dao': '/assets/characters/char_tran_hung_dao.webp',
  'ly-thuong-kiet': '/assets/characters/char_ly_thuong_kiet.webp',
  'le-loi': '/assets/characters/char_le_loi.webp',
  'nguyen-hue': '/assets/characters/char_nguyen_hue.webp',
  'ho-chi-minh': '/assets/characters/char_ho_chi_minh.webp',
  'vo-nguyen-giap': '/assets/characters/char_vo_nguyen_giap.png',

  // Batch 1 — AI-generated characters
  'hung-vuong-i': '/assets/characters/char_hung_vuong_i.png',
  'son-tinh-thuy-tinh': '/assets/characters/char_son_tinh_thuy_tinh.png',
  'an-duong-vuong': '/assets/characters/char_an_duong_vuong.png',
  
  // Batch 2
  'ba-trieu': '/assets/characters/char_ba_trieu.png',
  'hai-ba-trung': '/assets/characters/char_hai_ba_trung.png',
  'phung-hung': '/assets/characters/char_phung_hung.png',
  'dinh-bo-linh': '/assets/characters/dinh-bo-linh.png',
  'le-hoan': '/assets/characters/le-hoan.png',
  'ly-cong-uan': '/assets/characters/ly-cong-uan.png',

  // Events — map to primary character
  'dien-bien-phu': '/assets/characters/char_vo_nguyen_giap.png',
  'tran-dong-da': '/assets/characters/char_nguyen_hue.webp',
  'chien-thang-bach-dang': '/assets/characters/char_tran_hung_dao.webp',
  'chien-tranh-ly-tong': '/assets/characters/char_ly_thuong_kiet.webp',
  'khoi-nghia-lam-son': '/assets/characters/char_le_loi.webp',

  // Default fallback
  'default': '/assets/characters/char_default.webp',
};

const PERSPECTIVE_CHARACTER_PATHS = {
  'ho-chi-minh:contemporary': '/assets/characters/char_nguoi_dan_viet_nam.png',
  'ho-chi-minh:historian': '/assets/characters/char_historian_modern.png',
  'le-loi:contemporary': '/assets/characters/char_nguyen_trai.webp',
  'le-loi:historian': '/assets/characters/char_historian_modern.png',
  'nguyen-trai:contemporary': '/assets/characters/char_le_loi.webp',
  'nguyen-trai:historian': '/assets/characters/char_historian_modern.png',
  'ly-thuong-kiet:contemporary': '/assets/characters/char_default.webp',
  'ly-thuong-kiet:historian': '/assets/characters/char_historian_modern.png',
  'nguyen-hue:contemporary': '/assets/characters/char_ngo_thi_nham.png',
  'nguyen-hue:historian': '/assets/characters/char_historian_modern.png',
  'tran-hung-dao:contemporary': '/assets/characters/char_default.webp',
  'tran-hung-dao:historian': '/assets/characters/char_historian_modern.png',
  'chien-thang-bach-dang:tran-hung-dao': '/assets/characters/char_tran_hung_dao.webp',
  'chien-thang-bach-dang:contemporary': '/assets/characters/char_quan_si_nha_tran.png',
  'chien-thang-bach-dang:historian': '/assets/characters/char_historian_modern.png',
  'chien-tranh-ly-tong:ly-thuong-kiet': '/assets/characters/char_ly_thuong_kiet.webp',
  'chien-tranh-ly-tong:tong-quan': '/assets/characters/char_tuong_nha_tong.png',
  'chien-tranh-ly-tong:historian': '/assets/characters/char_historian_modern.png',
  'dien-bien-phu:viet-minh': '/assets/characters/char_vo_nguyen_giap.png',
  'dien-bien-phu:french': '/assets/characters/char_de_castries.png',
  'dien-bien-phu:historian': '/assets/characters/char_historian_modern.png',
  'khoi-nghia-lam-son:le-loi': '/assets/characters/char_le_loi.webp',
  'khoi-nghia-lam-son:nguyen-trai': '/assets/characters/char_nguyen_trai.webp',
  'khoi-nghia-lam-son:historian': '/assets/characters/char_historian_modern.png',
  'tran-dong-da:nguyen-hue': '/assets/characters/char_nguyen_hue.webp',
  'tran-dong-da:tong-doc-hu-binh': '/assets/characters/char_ton_si_nghi.png',
  'tran-dong-da:historian': '/assets/characters/char_historian_modern.png',
}

export function getBackgroundUrl(entityId) {
  const known = [
    'nguyen-trai', 'le-loi', 'tran-hung-dao', 'ly-thuong-kiet',
    'nguyen-hue', 'ho-chi-minh', 'khoi-nghia-lam-son',
    'chien-thang-bach-dang', 'chien-tranh-ly-tong',
    'tran-dong-da', 'dien-bien-phu'
  ]
  const id = known.includes(entityId) ? entityId : 'default'
  const fileName = id.replace(/-/g, '_')
  return `/assets/backgrounds/bg_${fileName}.webp`
}

export function getBackgroundSet(entityId) {
  const url = getBackgroundUrl(entityId)
  return {
    src: url,
    imageSet: `image-set(url("${url}") type("image/webp") 1x)`,
  }
}

export function getCharacterUrl(entityId) {
  return ENTITY_CHARACTER_PATHS[entityId] || ENTITY_CHARACTER_PATHS.default
}

export function getPerspectiveCharacterUrl(entityId, perspective) {
  const key = `${entityId}:${perspective}`
  return PERSPECTIVE_CHARACTER_PATHS[key] || getCharacterUrl(entityId)
}

export function getBgStyle(entityId) {
  const { src, imageSet } = getBackgroundSet(entityId)
  return {
    backgroundImage: imageSet || `url(${src})`,
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
