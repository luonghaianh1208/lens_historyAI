/**
 * Timeline Periods cho Lịch sử Việt Nam
 *
 * Mỗi period đại diện cho một giai đoạn lịch sử, chứa:
 * - id: định danh duy nhất
 * - name: tên period (hiển thị trên UI)
 * - startYear, endYear: khoảng thời gian
 * - colorTheme: theme gradient cho background
 * - entities: danh sách entity IDs thuộc period này
 *
 * Colors inspired by Vietnamese ancient motifs:
 * - Văn Lang: vàng đồng (Hùng Vương)
 * - Âu Lạc: xanh ngọc bích (An Dương Vương)
 * - Bắc Thuộc: đỏ son (kháng cự)
 * - Đại Việt: xanh lá (triều đại Lý-Trần hưng thịnh)
 * - Lê sơ: xanh lam (Hồ Chí Minh - nhưng cũng là màu của nước)
 * - Tây Sơn: đỏ cam (khí thế Tây Sơn)
 * - Nguyễn: nâu đất (cổ kính)
 * - Hiện đại: xanh lục (hy vọng)
 */

export const PERIODS = [
  {
    id: 'van-lang-au-lac',
    name: 'Thời kỳ Văn Lang - Âu Lạc',
    startYear: -2879,
    endYear: -111,
    colorTheme: {
      primary: '#b8860b', // Gold
      secondary: '#d4a843', // Light gold
      gradient: 'linear-gradient(135deg, #2c1810 0%, #8b4513 50%, #d4a843 100%)',
    },
    entities: ['hung-vuong-i', 'son-tinh-thuy-tinh', 'an-duong-vuong'],
    description: 'Thời kỳ đầu tiên trong lịch sử Việt Nam, với các vị vua Hùng và vua An Dương xây dựng đất nước.',
  },
  {
    id: 'bac-thuoc',
    name: 'Thời kỳ Bắc Thuộc',
    startYear: -111,
    endYear: 939,
    colorTheme: {
      primary: '#c0392b', // Vermilion
      secondary: '#e74c3c',
      gradient: 'linear-gradient(135deg, #5c1515 0%, #8b0000 50%, #c41e3a 100%)',
    },
    entities: ['ba-triệu', 'hai-ba-trung', 'ba-lieu', 'phung-hung'],
    description: '1123 năm chịu ảnh hưởng của các triều đại phương Bắc, với nhiều phong trào kháng chiến nổi tiếng.',
  },
  {
    id: 'dai-viet',
    name: 'Đại Việt (939-1802)',
    startYear: 939,
    endYear: 1802,
    colorTheme: {
      primary: '#2d6a4f', // Jade green
      secondary: '#3a8a65',
      gradient: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a27 50%, #8fbc8f 100%)',
    },
    subPeriods: [
      { id: 'dinh', name: 'Nhà Đinh', startYear: 939, endYear: 980 },
      { id: 'tien-le', name: 'Tiền Lê', startYear: 980, endYear: 1009 },
      { id: 'ly', name: 'Nhà Lý', startYear: 1009, endYear: 1225 },
      { id: 'tran', name: 'Nhà Trần', startYear: 1225, endYear: 1400 },
      { id: 'ho', name: 'Nhà Hồ', startYear: 1400, endYear: 1407 },
      { id: 'le-so', name: 'Lê sơ (Lê Lợi - Lê Thánh Tông)', startYear: 1428, endYear: 1527 },
      { id: 'le-trung-hung', name: 'Lê trung hưng', startYear: 1533, endYear: 1789 },
      { id: 'mac', name: 'Nhà Mạc', startYear: 1527, endYear: 1677 },
      { id: 'tay-son', name: 'Tây Sơn', startYear: 1778, endYear: 1802 },
    ],
    entities: [
      'dinh-bo-linh', 'le-hoan', 'le-dai-hanh',
      'ly-cong-uẩn', 'ly-thuong-kiet', 'ly-nhan-tong', 'to-hien-thanh',
      'tran-hung-dao', 'tran-nhan-tong', 'tran-quoc-tuan', 'le-phu-tran', 'tran-thu-do',
      'ho-quy-ly',
      'le-loi', 'nguyen-trai', 'le-thanh-tong', 'nguyen-thi-anh',
      'mac-dang-dung', 'trinh-kiem', 'nguyen-hoang',
      'quang-trung', 'nguyen-hue', 'nguyen-nhac',
    ],
    description: 'Thời kỳ độc lập và phát triển rực rỡ của Đại Việt, với nhiều triều đại hưng thịnh và chiến thắng lịch sử.',
  },
  {
    id: 'nguyen',
    name: 'Nhà Nguyễn (1802-1945)',
    startYear: 1802,
    endYear: 1945,
    colorTheme: {
      primary: '#6b3410', // Dark brown
      secondary: '#8b4513', // Saddle brown
      gradient: 'linear-gradient(135deg, #2c1810 0%, #5c3a1e 50%, #b8860b 100%)',
    },
    entities: [
      'gia-long', 'minh-mang', 'tu-duc',
      'truong-dinh', 'phan-dinh-phung',
      'phan-boi-chau', 'phan-chau-trinh',
    ],
    description: 'Triều đại cuối cùng của Việt Nam, với thời kỳ kháng chiến chống thực dân Pháp.',
  },
  {
    id: 'hien-dai',
    name: 'Việt Nam Hiện đại (1945-1975)',
    startYear: 1945,
    endYear: 1975,
    colorTheme: {
      primary: '#2d6a4f', // Jade - hòa bình
      secondary: '#1b4332', // Dark green
      gradient: 'linear-gradient(135deg, #1a2f1a 0%, #2d5a3f 50%, #90b090 100%)',
    },
    entities: ['ho-chi-minh', 'vo-nguyen-giap', 'truong-chinh', 'dien-bien-phu', 'tran-dong-da'],
    description: 'Thời kỳ đấu tranh giành độc lập và thống nhất đất nước, với những chiến thắng lịch sử.',
  },
]

/**
 * Helper: Lấy period theo entityId
 */
export function getPeriodForEntity(entityId) {
  for (const period of PERIODS) {
    if (period.entities.includes(entityId)) {
      return period
    }
  }
  return null
}

/**
 * Helper: Lấy tất cả entities trong một period
 */
export function getEntitiesByPeriod(periodId) {
  const period = PERIODS.find(p => p.id === periodId)
  return period ? period.entities : []
}

/**
 * Helper: Lấy period tiếp theo (theo startYear)
 */
export function getNextPeriod(currentPeriodId) {
  const currentIndex = PERIODS.findIndex(p => p.id === currentPeriodId)
  if (currentIndex < PERIODS.length - 1) {
    return PERIODS[currentIndex + 1]
  }
  return null
}

/**
 * Helper: Lấy period trước đó
 */
export function getPreviousPeriod(currentPeriodId) {
  const currentIndex = PERIODS.findIndex(p => p.id === currentPeriodId)
  if (currentIndex > 0) {
    return PERIODS[currentIndex - 1]
  }
  return null
}

/**
 * Helper: Format year range for display
 */
export function formatYearRange(startYear, endYear) {
  const formatBC = (year) => {
    if (year < 0) {
      return `${Math.abs(year)} TCN`
    }
    return `${year}`
  }
  return `${formatBC(startYear)} - ${formatBC(endYear)}`
}

export default PERIODS
