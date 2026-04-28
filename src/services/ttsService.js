// Gemini TTS voice configurations per historical character
// Gemini 2.5 flash accepts strings: "Puck", "Charon", "Kore", "Fenrir", "Aoede"

export const VOICE_CONFIGS = {
  // PERSONS
  'nguyen-trai': {
    name: 'Nguyễn Trãi',
    gender: 'MALE',
    voiceName: 'Puck', // Softer, educated male
    description: 'Giọng điềm tĩnh, văn chương'
  },
  'le-loi': {
    name: 'Lê Lợi',
    gender: 'MALE',
    voiceName: 'Charon', // Strong, leader
    description: 'Giọng trầm mạnh mẽ, quyết đoán'
  },
  'tran-hung-dao': {
    name: 'Trần Hưng Đạo',
    gender: 'MALE',
    voiceName: 'Fenrir', // Authoritative
    description: 'Giọng oai vệ, uy nghiêm'
  },
  'ly-thuong-kiet': {
    name: 'Lý Thường Kiệt',
    gender: 'MALE',
    voiceName: 'Charon', // Balanced, educated but strong
    description: 'Giọng rắn rỏi, tự tin'
  },
  'nguyen-hue': {
    name: 'Nguyễn Huệ',
    gender: 'MALE',
    voiceName: 'Puck',
    description: 'Giọng hào sảng, bách chiến bách thắng'
  },
  'ho-chi-minh': {
    name: 'Hồ Chí Minh',
    gender: 'MALE',
    voiceName: 'Charon',
    description: 'Giọng điềm đạm, ấm áp, kiên định'
  },
  // EVENTS - default voices
  'khoi-nghia-lam-son': {
    name: 'Khởi nghĩa Lam Sơn',
    gender: 'MALE',
    voiceName: 'Fenrir',
    description: 'Giọng kể uy nghiêm'
  },
  'chien-thang-bach-dang': {
    name: 'Chiến thắng Bạch Đằng',
    gender: 'MALE',
    voiceName: 'Charon',
    description: 'Giọng hào hùng'
  },
  'chien-tranh-ly-tong': {
    name: 'Chiến tranh Lý–Tống',
    gender: 'MALE',
    voiceName: 'Puck',
    description: 'Giọng kể chuyện'
  },
  'tran-dong-da': {
    name: 'Trận Ngọc Hồi - Đống Đa',
    gender: 'MALE',
    voiceName: 'Fenrir',
    description: 'Giọng tốc hành, uy dũng'
  },
  'dien-bien-phu': {
    name: 'Chiến thắng Điện Biên Phủ',
    gender: 'MALE',
    voiceName: 'Charon',
    description: 'Giọng oai hùng, vững chắc'
  },
  // Default fallback
  default: {
    gender: 'MALE',
    voiceName: 'Puck'
  }
}

export function getVoiceConfig(entityId) {
  return VOICE_CONFIGS[entityId] || VOICE_CONFIGS.default
}

export function buildTTSPayload(text, entityId) {
  const voice = getVoiceConfig(entityId)
  return {
    text,
    voiceName: voice.voiceName
  }
}

export function audioBufferToUrl(buffer) {
  const blob = new Blob([buffer], { type: 'audio/wav' }) // Gemini WAV conversion
  return URL.createObjectURL(blob)
}