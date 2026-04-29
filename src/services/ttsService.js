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

/**
 * Chia text thành các chunk nhỏ để TTS xử lý tuần tự.
 * Ưu tiên cắt tại: cuối đoạn văn (\n\n) → cuối câu (. ! ?) → giữa câu (,)
 */
export function splitIntoChunks(text, maxChunkSize = 400) {
  if (text.length <= maxChunkSize) return [text]

  const chunks = []
  let remaining = text.trim()

  while (remaining.length > 0) {
    if (remaining.length <= maxChunkSize) {
      chunks.push(remaining.trim())
      break
    }

    const slice = remaining.substring(0, maxChunkSize)

    // Ưu tiên 1: cắt tại cuối đoạn văn
    const paraBreak = slice.lastIndexOf('\n\n')
    if (paraBreak > maxChunkSize * 0.4) {
      chunks.push(remaining.substring(0, paraBreak).trim())
      remaining = remaining.substring(paraBreak + 2).trim()
      continue
    }

    // Ưu tiên 2: cắt tại cuối câu (. ! ?)
    const sentenceEnd = Math.max(
      slice.lastIndexOf('.'),
      slice.lastIndexOf('!'),
      slice.lastIndexOf('?'),
      slice.lastIndexOf('。'),
      slice.lastIndexOf('…')
    )
    if (sentenceEnd > maxChunkSize * 0.35) {
      chunks.push(remaining.substring(0, sentenceEnd + 1).trim())
      remaining = remaining.substring(sentenceEnd + 1).trim()
      continue
    }

    // Ưu tiên 3: cắt tại dấu phẩy hoặc dấu chấm phẩy
    const commaBreak = Math.max(
      slice.lastIndexOf(','),
      slice.lastIndexOf(';'),
      slice.lastIndexOf(':')
    )
    if (commaBreak > maxChunkSize * 0.3) {
      chunks.push(remaining.substring(0, commaBreak + 1).trim())
      remaining = remaining.substring(commaBreak + 1).trim()
      continue
    }

    // Fallback: cắt tại khoảng trắng gần nhất
    const spaceBreak = slice.lastIndexOf(' ')
    if (spaceBreak > maxChunkSize * 0.5) {
      chunks.push(remaining.substring(0, spaceBreak).trim())
      remaining = remaining.substring(spaceBreak + 1).trim()
    } else {
      // Không tìm được điểm cắt tự nhiên → cắt cứng
      chunks.push(remaining.substring(0, maxChunkSize).trim())
      remaining = remaining.substring(maxChunkSize).trim()
    }
  }

  return chunks.filter(c => c.length > 0)
}