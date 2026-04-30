import nguyenTrai from '../data/entities/nguyen-trai.json'
import leLoi from '../data/entities/le-loi.json'
import tranHungDao from '../data/entities/tran-hung-dao.json'
import lyThuongKiet from '../data/entities/ly-thuong-kiet.json'
import khoiNghiaLamSon from '../data/events/khoi-nghia-lam-son.json'
import chienThangBachDang from '../data/events/chien-thang-bach-dang.json'
import chienTranhLyTong from '../data/events/chien-tranh-ly-tong.json'
import nguyenHue from '../data/entities/nguyen-hue.json'
import hoChiMinh from '../data/entities/ho-chi-minh.json'
import tranDongDa from '../data/events/tran-dong-da.json'
import dienBienPhu from '../data/events/dien-bien-phu.json'

const entities = {
  'nguyen-trai': nguyenTrai,
  'le-loi': leLoi,
  'tran-hung-dao': tranHungDao,
  'ly-thuong-kiet': lyThuongKiet,
  'khoi-nghia-lam-son': khoiNghiaLamSon,
  'chien-thang-bach-dang': chienThangBachDang,
  'chien-tranh-ly-tong': chienTranhLyTong,
  'nguyen-hue': nguyenHue,
  'ho-chi-minh': hoChiMinh,
  'tran-dong-da': tranDongDa,
  'dien-bien-phu': dienBienPhu
}

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

export function getEntity(id) {
  return entities[id] || null
}

export function getAllEntities() {
  return Object.values(entities)
}

export function searchEntities(query) {
  const q = normalizeText(query)
  if (!q) return []

  return Object.values(entities).filter(entity => {
    const nameMatch = normalizeText(entity.name).includes(q)
    const aliasMatch = entity.aliases?.some(a => normalizeText(a).includes(q))
    const tagMatch = entity.tags?.some(t => normalizeText(t).includes(q))
    const periodMatch = normalizeText(entity.period).includes(q)
    return nameMatch || aliasMatch || tagMatch || periodMatch
  })
}

export function getIndex() {
  return [
    { id: 'nguyen-trai', type: 'person', name: 'Nguyễn Trãi', period: 'Hậu Lê sơ', tags: ['quân sư', 'nhà thơ'] },
    { id: 'le-loi', type: 'person', name: 'Lê Lợi', period: 'Hậu Lê sơ', tags: ['vua', 'khởi nghĩa'] },
    { id: 'tran-hung-dao', type: 'person', name: 'Trần Hưng Đạo', period: 'Nhà Trần', tags: ['tướng quân'] },
    { id: 'ly-thuong-kiet', type: 'person', name: 'Lý Thường Kiệt', period: 'Nhà Lý', tags: ['tướng quân', 'chống Tống'] },
    { id: 'khoi-nghia-lam-son', type: 'event', name: 'Khởi nghĩa Lam Sơn', period: '1418-1427', tags: ['kháng chiến'] },
    { id: 'chien-thang-bach-dang', type: 'event', name: 'Chiến thắng Bạch Đằng', period: '1288', tags: ['trận đánh'] },
    { id: 'chien-tranh-ly-tong', type: 'event', name: 'Chiến tranh Lý–Tống', period: '1075-1077', tags: ['kháng chiến', 'nhà Lý'] },
    { id: 'nguyen-hue', type: 'person', name: 'Nguyễn Huệ (Quang Trung)', period: 'Nhà Tây Sơn', tags: ['hoàng đế', 'quân sự'] },
    { id: 'ho-chi-minh', type: 'person', name: 'Hồ Chí Minh', period: 'Việt Nam Dân chủ Cộng hòa', tags: ['chủ tịch', 'cách mạng'] },
    { id: 'tran-dong-da', type: 'event', name: 'Trận Ngọc Hồi Đống Đa', period: '1789', tags: ['kháng chiến', 'nhà Tây Sơn'] },
    { id: 'dien-bien-phu', type: 'event', name: 'Chiến thắng Điện Biên Phủ', period: '1954', tags: ['kháng chiến', 'thắng lợi'] }
  ]
}
