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
  'vo-nguyen-giap': {
    name: 'Võ Nguyên Giáp',
    gender: 'MALE',
    voiceName: 'Charon', // Authoritative, deep — matching entity JSON
    description: 'Giọng trầm tĩnh, chiến lược, bản lĩnh của vị Đại tướng'
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

const PRESET_TTS_STYLES = {
  'ho-chi-minh': {
    self: 'Giọng miền Bắc chuẩn, ấm, điềm đạm, tiết tấu chậm vừa, phát âm rõ từng ý như một bậc lãnh tụ lớn tuổi đang trò chuyện thân tình với thế hệ sau.',
    contemporary: 'Giọng người dân miền Bắc thời kháng chiến, mộc mạc, chân tình, hơi nghẹn cảm xúc ở những đoạn nhớ thương nhưng vẫn rõ ràng, dễ nghe.',
    historian: 'Giọng thuyết minh học thuật miền Bắc chuẩn, khách quan, điềm tĩnh, nhấn nhẹ vào các khái niệm lịch sử quan trọng.',
  },
  'le-loi': {
    self: 'Giọng nam trầm, chắc, mang sắc Bắc Trung Bộ rất nhẹ của xứ Thanh, khí chất thủ lĩnh nghĩa quân, nói trực diện, mạnh mà không gắt.',
    contemporary: 'Giọng kể dân dã Bắc Trung Bộ nhẹ, chân thật, kính phục chúa công nhưng không khoa trương.',
    historian: 'Giọng sử gia miền Bắc chuẩn, mạch lạc, có độ chắc và trang trọng khi phân tích chính trị quân sự.',
  },
  'nguyen-trai': {
    self: 'Giọng miền Bắc chuẩn, trầm, điềm, có nhịp văn nhã như một bậc đại thần và thi nhân đang hồi tưởng.',
    contemporary: 'Giọng nam miền Bắc của người cầm quyền từng trải, thực tế hơn văn chương, vẫn giữ sự kính trọng với Nguyễn Trãi.',
    historian: 'Giọng phân tích miền Bắc chuẩn, học thuật, rõ chữ, tiết tấu chậm vừa để nghe như một bài giảng lịch sử chất lượng.',
  },
  'tran-hung-dao': {
    self: 'Giọng miền Bắc trầm hùng, uy nghi, nhịp chắc, mang khí chất vị tổng chỉ huy từng trải nhưng không quá sân khấu hóa.',
    contemporary: 'Giọng nam miền Bắc của văn thần nhà Trần, kính trọng, tinh tế, có chiều sâu quan sát.',
    historian: 'Giọng thuyết minh học thuật miền Bắc, sang, chặt chẽ, nhấn vào chiến lược và bối cảnh quốc tế.',
  },
  'ly-thuong-kiet': {
    self: 'Giọng nam miền Bắc rắn rỏi, điềm mà sắc, nhịp rõ, có phong thái vị tướng chủ động và quyết đoán.',
    contemporary: 'Giọng kể của quan lại triều Lý, miền Bắc chuẩn, kính cẩn nhưng vẫn có cảm xúc người chứng kiến.',
    historian: 'Giọng sử học miền Bắc chuẩn, phân tích tỉnh táo, nhấn đúng các điểm tranh luận học thuật.',
  },
  'nguyen-hue': {
    self: 'Giọng nam hào sảng, dứt khoát, mang sắc Nam Trung Bộ rất nhẹ theo chất Bình Định, tốc độ nhanh vừa, giàu khí thế trận mạc.',
    contemporary: 'Giọng Bắc Bộ của bậc sĩ phu như Ngô Thì Nhậm, điềm hơn, tinh tế hơn, nhưng vẫn đầy kính phục trước Quang Trung.',
    historian: 'Giọng phân tích miền Bắc chuẩn, mạnh ở các điểm nhấn về cải cách, quân sự và bối cảnh khu vực.',
  },
  'vo-nguyen-giap': {
    self: 'Giọng nam Bắc Trung Bộ nhẹ theo chất Quảng Bình, trầm tĩnh, bản lĩnh, mang khí chất của vị Đại tướng đang hồi tưởng chiến dịch, không đọc quá nhanh.',
    contemporary: 'Giọng bộ đội miền Bắc thời kháng chiến, mộc mạc, nhiệt thành, kể về Đại tướng với niềm kính trọng và xúc động thật.',
    historian: 'Giọng sử gia quân sự miền Bắc chuẩn, khách quan, phân tích chiến lược mạch lạc, nhấn đúng các điểm then chốt.',
  },
  'khoi-nghia-lam-son': {
    'le-loi': 'Giọng nam trầm chắc, sắc Bắc Trung Bộ nhẹ, khí chất chúa công Lam Sơn, nói rõ ràng, cứng cỏi.',
    'nguyen-trai': 'Giọng miền Bắc chuẩn, văn nhã, sâu lắng, của một quân sư dùng đạo nghĩa để luận đại cuộc.',
    historian: 'Giọng học thuật miền Bắc chuẩn, khách quan, nhấn nhá hợp lý ở các mốc chuyển biến của khởi nghĩa.',
  },
  'chien-thang-bach-dang': {
    'tran-hung-dao': 'Giọng miền Bắc trầm hùng, uy nghi, nhịp chắc, giàu khí thế thủy chiến và mệnh lệnh chiến trường.',
    contemporary: 'Giọng kể mộc của quân sĩ nhà Trần, miền Bắc chuẩn, cảm xúc thật, không tô vẽ quá mức.',
    historian: 'Giọng thuyết minh lịch sử miền Bắc, khách quan, có chiều sâu quân sự và sử liệu.',
  },
  'chien-tranh-ly-tong': {
    'ly-thuong-kiet': 'Giọng nam miền Bắc rắn rỏi, dứt khoát, có chất vị tướng chủ động ra quyết định lớn.',
    'tong-quan': 'Giọng tiếng Việt rõ ràng, trang trọng, hơi giữ khoảng cách như lời kể của một viên tướng ngoại quốc đang nhìn lại thất bại.',
    historian: 'Giọng sử học miền Bắc chuẩn, phân tích chiến lược mạch lạc, nhấn vào nguyên nhân và hệ quả.',
  },
  'dien-bien-phu': {
    'viet-minh': 'Giọng nam miền Bắc chuẩn, điềm tĩnh, bản lĩnh, mang khí chất của người chỉ huy chiến dịch lớn, không đọc quá nhanh.',
    french: 'Giọng tiếng Việt rõ, trang trọng, có cảm giác của nhân vật ngoại quốc hồi tưởng thất bại, không dùng sắc vùng miền Việt quá đậm.',
    historian: 'Giọng thuyết minh học thuật miền Bắc chuẩn, rõ chữ, nghiêm túc, phù hợp nội dung lịch sử cận hiện đại.',
  },
  'tran-dong-da': {
    'nguyen-hue': 'Giọng nam hào sảng, dứt khoát, sắc Nam Trung Bộ rất nhẹ, giàu năng lượng và nhịp tiến công thần tốc.',
    'tong-doc-hu-binh': 'Giọng tiếng Việt rõ, điềm, giữ sắc thái của một viên tướng ngoại bang đang thừa nhận sai lầm chiến lược.',
    historian: 'Giọng sử học miền Bắc chuẩn, sáng rõ, nhấn vào nghệ thuật hành quân và tầm vóc chiến thắng.',
  },
}

const DEFAULT_TTS_STYLE = {
  self: 'Giọng kể lịch sử tiếng Việt tự nhiên, rõ chữ, có khí chất nhân vật, tiết tấu vừa phải.',
  contemporary: 'Giọng kể nhân chứng tiếng Việt tự nhiên, gần gũi, chân thật, có cảm xúc nhưng không cường điệu.',
  historian: 'Giọng thuyết minh học thuật tiếng Việt, khách quan, mạch lạc, rõ ràng.',
  default: 'Giọng kể lịch sử tiếng Việt rõ ràng, tự nhiên, trang trọng, nhịp vừa phải.',
}

export function getVoiceConfig(entityId) {
  return VOICE_CONFIGS[entityId] || VOICE_CONFIGS.default
}

export function getPresetTTSStyle(entityId, perspective = 'default') {
  const entityStyles = PRESET_TTS_STYLES[entityId]
  if (entityStyles?.[perspective]) return entityStyles[perspective]
  if (DEFAULT_TTS_STYLE[perspective]) return DEFAULT_TTS_STYLE[perspective]
  return DEFAULT_TTS_STYLE.default
}

export function buildStyledTTSText(text, { entityId, perspective } = {}) {
  const style = getPresetTTSStyle(entityId, perspective)
  return `Đọc đoạn sau bằng giọng tiếng Việt rõ ràng, tự nhiên và giàu màu sắc lịch sử.

YÊU CẦU GIỌNG ĐỌC:
- ${style}
- Giữ phát âm tiếng Việt chuẩn, ưu tiên độ rõ chữ và dễ nghe.
- Nếu có sắc thái vùng miền, chỉ thể hiện nhẹ vừa đủ để gợi đúng vùng, không làm khó nghe.
- Không đọc như quảng cáo hay bản tin máy móc; hãy đọc như lời kể sống động của nhân vật hoặc người kể sử.

NỘI DUNG CẦN ĐỌC:
${text}`
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
