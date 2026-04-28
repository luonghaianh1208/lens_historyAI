// Google Cloud TTS voice configurations per historical character

export const VOICE_CONFIGS = {
  // PERSONS
  'nguyen-trai': {
    name: 'Nguyễn Trãi',
    gender: 'MALE',
    locale: 'vi-VN',
    voiceName: 'vi-VN-Standard-C', // Softer, educated male - scholar tone
    speakingRate: 0.9,
    pitch: -1.5,
    description: 'Giọng trầm ấm, điềm tĩnh, văn chương'
  },
  'le-loi': {
    name: 'Lê Lợi',
    gender: 'MALE',
    locale: 'vi-VN',
    voiceName: 'vi-VN-Standard-D', // Strong, confident male - leader tone
    speakingRate: 0.95,
    pitch: 0,
    description: 'Giọng trầm mạnh mẽ, quyết đoán'
  },
  'tran-hung-dao': {
    name: 'Trần Hưng Đạo',
    gender: 'MALE',
    locale: 'vi-VN',
    voiceName: 'vi-VN-Standard-B', // Authoritative military leader
    speakingRate: 0.9,
    pitch: -1,
    description: 'Giọng oai vệ, uy nghiêm'
  },
  'ly-thuong-kiet': {
    name: 'Lý Thường Kiệt',
    gender: 'MALE',
    locale: 'vi-VN',
    voiceName: 'vi-VN-Standard-A', // Balanced, educated but strong
    speakingRate: 0.95,
    pitch: 0.5,
    description: 'Giọng rắn rỏi, tự tin'
  },
  // EVENTS - default voices
  'khoi-nghia-lam-son': {
    name: 'Khởi nghĩa Lam Sơn',
    gender: 'MALE',
    locale: 'vi-VN',
    voiceName: 'vi-VN-Standard-D',
    speakingRate: 0.9,
    pitch: 0,
    description: 'Giọng kể uy nghiêm'
  },
  'chien-thang-bach-dang': {
    name: 'Chiến thắng Bạch Đằng',
    gender: 'MALE',
    locale: 'vi-VN',
    voiceName: 'vi-VN-Standard-D',
    speakingRate: 0.95,
    pitch: 0,
    description: 'Giọng hào hùng'
  },
  'chien-tranh-ly-tong': {
    name: 'Chiến tranh Lý–Tống',
    gender: 'MALE',
    locale: 'vi-VN',
    voiceName: 'vi-VN-Standard-B',
    speakingRate: 0.9,
    pitch: 0,
    description: 'Giọng kể chiến trận'
  },
  // Default fallback
  default: {
    gender: 'MALE',
    locale: 'vi-VN',
    voiceName: 'vi-VN-Standard-A',
    speakingRate: 1.0,
    pitch: 0
  }
}

export function getVoiceConfig(entityId) {
  return VOICE_CONFIGS[entityId] || VOICE_CONFIGS.default
}

export function buildTTSPayload(text, entityId) {
  const voice = getVoiceConfig(entityId)
  return {
    input: { text },
    voice: {
      languageCode: voice.locale,
      name: voice.voiceName
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: voice.speakingRate,
      pitch: voice.pitch,
      sampleRateHertz: 24000
    }
  }
}

export function audioBufferToUrl(buffer) {
  const blob = new Blob([buffer], { type: 'audio/mp3' })
  return URL.createObjectURL(blob)
}