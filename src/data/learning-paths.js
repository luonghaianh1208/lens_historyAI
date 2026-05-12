/**
 * Learning Paths Data Structure
 * Progressive learning journeys for Vietnamese history
 */

export const LEARNING_PATHS = {
  'basic-vietnamese-history': {
    id: 'basic-vietnamese-history',
    title: 'Lịch sử Việt Nam cơ bản',
    description: 'Hành trình 12 bước qua 2000 năm lịch sử, từ Hùng Vương đến Hồ Chí Minh',
    icon: '📚',
    difficulty: 'beginner',
    estimatedHours: 20,
    prerequisites: [],
    levels: [
      {
        id: 'level-1',
        title: 'Thời kỳ Văn Lang - Âu Lạc',
        description: 'Khám phá lịch sử Việt Nam từ thời kỳ Hùng Vương',
        requiredScore: 70,
        entities: ['hung-vuong-i', 'son-tinh-thuy-tinh', 'an-duong-vuong'],
        unlockMessage: 'Hoàn thành để mở khóa giai đoạn tiếp theo',
      },
      {
        id: 'level-2',
        title: 'Thời Bắc Thuộc và Khởi nghĩa',
        description: '1000 năm Bắc thuộc và tinh thần yêu nước',
        requiredScore: 70,
        entities: ['hai-ba-trung', 'ba-triệu', 'phung-hung'],
        unlockMessage: 'Tiếp tục hành trình',
      },
      {
        id: 'level-3',
        title: 'Đại Việt: Nhà Đinh và Tiền Lê',
        description: 'Đất nước độc lập và những vị vua đầu tiên',
        requiredScore: 70,
        entities: ['dinh-bo-linh', 'le-hoan', 'le-dai-hanh'],
        unlockMessage: 'Bạn đang tiến bộ!',
      },
      {
        id: 'level-4',
        title: 'Thời Lý - Tràng phồn vinh',
        description: 'Đại Việt hùng cường thời Lý Trần',
        requiredScore: 70,
        entities: ['ly-cong-uẩn', 'ly-thuong-kiet', 'ly-nhan-tong', 'to-hien-thanh'],
        unlockMessage: 'Một nửa hành trình đã qua!',
      },
      {
        id: 'level-5',
        title: 'Nhà Trần và chiến thắng quân Nguyên Mông',
        description: 'Đức Hồ Trần và 3 lần chống phương Bắc',
        requiredScore: 70,
        entities: ['tran-hung-dao', 'tran-nhan-tong', 'le-phu-tran', 'tran-thu-do'],
        unlockMessage: 'Bạn là chuyên gia lịch sử!',
      },
    ],
    rewards: {
      badge: 'Người học lịch sử',
      certificate: true,
      bonusPoints: 500,
    },
  },

  'feudal-dynasties': {
    id: 'feudal-dynasties',
    title: 'Các triều đại phong kiến',
    description: 'Tìm hiểu sâu về từng triều đại và những vị vua, tướng tài',
    icon: '👑',
    difficulty: 'intermediate',
    estimatedHours: 30,
    prerequisites: ['basic-vietnamese-history'],
    levels: [
      {
        id: 'hồ-dynasty',
        title: 'Nhà Hồ',
        description: 'Triều Hồ - những cải cách và sự ngắn ngủi',
        requiredScore: 75,
        entities: ['ho-quy-ly'],
        unlockMessage: 'Triều Hồ - chuyển giao từ Trần sang Hồ',
      },
      {
        id: 'lê-sơ-dynasty',
        title: 'Nhà Lê sơ (Lê Lợi - Lê Thánh Tông)',
        description: 'Thời kỳ hưng thịnh nhất của Việt Nam phong kiến',
        requiredScore: 75,
        entities: ['le-loi', 'nguyen-trai', 'le-thanh-tong', 'nguyen-thi-anh'],
        unlockMessage: 'Đại Việt thịnh trị!',
      },
      {
        id: 'lê-trung-hưng-mạc-nguyễn',
        title: 'Thời Lê trung hưng - Mạc - Nguyễn',
        description: 'Thời kỳ phân tranh và sự hình thành chúa Bầu, chúa Trịnh, chúa Nguyễn',
        requiredScore: 75,
        entities: ['mac-dang-dung', 'trinh-kiem', 'nguyen-hoang'],
        unlockMessage: 'Tiếp cận thời hiện đại',
      },
    ],
    rewards: {
      badge: 'Chuyên gia triều đại',
      certificate: true,
      bonusPoints: 300,
    },
  },

  'national-heroes': {
    id: 'national-heroes',
    title: 'Các vị anh hùng dân tộc',
    description: 'Những con người đã định hình lịch sử Việt Nam',
    icon: '⚔️',
    difficulty: 'intermediate',
    estimatedHours: 25,
    prerequisites: [],
    levels: [
      {
        id: 'early-heroes',
        title: 'Anh hùng thời kỳ xa xưa',
        description: 'Hai Bà Trưng, Bà Triệu - những người phụ nữ anh hùng',
        requiredScore: 70,
        entities: ['hai-ba-trung', 'ba-triệu', 'ba-lieu'],
        unlockMessage: 'Tinh thần bất khuất!',
      },
      {
        id: 'medieval-generals',
        title: 'Danh tướng đời Lý Trần',
        description: 'Lý Thường Kiệt, Trần Hưng Đạo - hùng hoàng quân sự',
        requiredScore: 75,
        entities: ['ly-thuong-kiet', 'tran-hung-dao', 'le-phu-tran'],
        unlockMessage: 'Bạn hiểu rõ về võ tướng!',
      },
      {
        id: 'anti-colonial-heroes',
        title: 'Anh hùng chống thực dân',
        description: 'Quang Trung, Trương Định, Phan Đình Phùng',
        requiredScore: 75,
        entities: ['quang-trung', 'nguyen-hue', 'truong-dinh', 'phan-dinh-phung'],
        unlockMessage: 'Đấu tranh không khoan nhượng!',
      },
      {
        id: 'modern-revolutionaries',
        title: 'Nhà cách mạng hiện đại',
        description: 'Phan Bội Châu, Phan Châu Trinh, Hồ Chí Minh',
        requiredScore: 75,
        entities: ['phan-boi-chau', 'phan-chau-trinh', 'ho-chi-minh'],
        unlockMessage: 'Hành trình đến độc lập!',
      },
    ],
    rewards: {
      badge: 'Người hùng lịch sử',
      certificate: true,
      bonusPoints: 400,
    },
  },

  'wars-and-independence': {
    id: 'wars-and-independence',
    title: 'Chiến tranh và độc lập',
    description: 'Các cuộc chiến tranh quan trọng trong lịch sử Việt Nam',
    icon: '🎖️',
    difficulty: 'advanced',
    estimatedHours: 35,
    prerequisites: ['basic-vietnamese-history'],
    levels: [
      {
        id: 'ancient-battles',
        title: 'Trận Bạch Đằng',
        description: '3 lần chiến thắng quân phương Bắc trên sông Bạch Đằng',
        requiredScore: 75,
        entities: ['chien-thang-bach-dang', 'tran-dong-da'],
        unlockMessage: 'Chiến thắng lừng lẫy!',
      },
      {
        id: 'lam-son-uprising',
        title: 'Khởi nghĩa Lam Sơn',
        description: '10 năm kháng cự và mở đường đến thăng biệt',
        requiredScore: 75,
        entities: ['khoi-nghia-lam-son', 'le-loi', 'nguyen-trai'],
        unlockMessage: 'Vua Lê Lợi và tài năng của Nguyễn Trãi',
      },
      {
        id: 'tay-son-rebellion',
        title: 'Tây Sơn - quét sạch chúa Trịnh, chúa Nguyễn',
        description: 'Quang Trung và cuộc khởi nghĩa vĩ đại',
        requiredScore: 80,
        entities: ['quang-trung', 'nguyen-hue', 'chien-tranh-ly-tong'],
        unlockMessage: 'Quang Trung - vị anh hùng vạn thế!',
      },
      {
        id: 'dien-bien-phu',
        title: 'Điện Biên Phủ - Điểm nhấn lịch sử',
        description: 'Chiến thắng chấn động địa cầu năm 1954',
        requiredScore: 80,
        entities: ['dien-bien-phu', 'vo-nguyen-giap'],
        unlockMessage: 'Chiến thắng Điện Biên Phủ - lịch sử được viết nên!',
      },
    ],
    rewards: {
      badge: 'Nhà sử học quân sự',
      certificate: true,
      bonusPoints: 600,
    },
  },
}

/**
 * Helper functions
 */
export function getLearningPath(pathId) {
  return LEARNING_PATHS[pathId] || null
}

export function getAllLearningPaths() {
  return Object.values(LEARNING_PATHS)
}

export function getPathProgress(pathId, userId = 'default') {
  // TODO: Load from localStorage with userId
  const storageKey = `learning-path-progress-${pathId}`
  const saved = localStorage?.getItem?.(storageKey)
  return saved ? JSON.parse(saved) : {
    pathId,
    completedLevels: [],
    currentLevel: null,
    totalScore: 0,
    startedAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
  }
}

export function savePathProgress(pathId, progress) {
  const storageKey = `learning-path-progress-${pathId}`
  localStorage?.setItem?.(storageKey, JSON.stringify(progress))
}

export function isPathUnlocked(pathId, userProgress = {}) {
  const path = getLearningPath(pathId)
  if (!path) return false

  // No prerequisites = always unlocked
  if (!path.prerequisites || path.prerequisites.length === 0) {
    return true
  }

  // Validate prerequisites exist before checking
  const validPrerequisites = path.prerequisites.filter(prereqId => getLearningPath(prereqId))

  // Check all valid prerequisites are completed
  return validPrerequisites.every(prereqId =>
    userProgress[prereqId]?.completedLevels?.length > 0
  )
}

export function getNextUnlockableEntity(progress) {
  // Find paths user is eligible for but hasn't started
  const allPaths = getAllLearningPaths()
  for (const path of allPaths) {
    // Skip if path doesn't exist or has no valid prerequisites
    if (!path || !path.prerequisites || path.prerequisites.length === 0) {
      continue
    }

    // Check if path is locked
    if (!isPathUnlocked(path.id, progress)) {
      const prereq = path.prerequisites[0]
      const prereqPath = getLearningPath(prereq)
      return {
        pathId: path.id,
        blockedBy: prereq,
        message: `Cần hoàn thành "${prereqPath?.title || 'lộ trình đầu tiên'}" trước`,
      }
    }
  }
  return null
}

export default LEARNING_PATHS
