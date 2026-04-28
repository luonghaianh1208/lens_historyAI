import nguyenTrai from '../data/entities/nguyen-trai.json'
import leLoi from '../data/entities/le-loi.json'
import tranHungDao from '../data/entities/tran-hung-dao.json'
import khoiNghiaLamSon from '../data/events/khoi-nghia-lam-son.json'
import chienThangBachDang from '../data/events/chien-thang-bach-dang.json'

const entities = {
  'nguyen-trai': nguyenTrai,
  'le-loi': leLoi,
  'tran-hung-dao': tranHungDao,
  'khoi-nghia-lam-son': khoiNghiaLamSon,
  'chien-thang-bach-dang': chienThangBachDang
}

export function getEntity(id) {
  return entities[id] || null
}

export function getAllEntities() {
  return Object.values(entities)
}

export function searchEntities(query) {
  const q = query.toLowerCase().trim()
  if (!q) return []

  return Object.values(entities).filter(entity => {
    const nameMatch = entity.name.toLowerCase().includes(q)
    const aliasMatch = entity.aliases?.some(a => a.toLowerCase().includes(q))
    const tagMatch = entity.tags?.some(t => t.toLowerCase().includes(q))
    const periodMatch = entity.period?.toLowerCase().includes(q)
    return nameMatch || aliasMatch || tagMatch || periodMatch
  })
}

export function getIndex() {
  return [
    { id: 'nguyen-trai', type: 'person', name: 'Nguyễn Trãi', period: 'Hậu Lê sơ', tags: ['quân sư', 'nhà thơ'] },
    { id: 'le-loi', type: 'person', name: 'Lê Lợi', period: 'Hậu Lê sơ', tags: ['vua', 'khởi nghĩa'] },
    { id: 'tran-hung-dao', type: 'person', name: 'Trần Hưng Đạo', period: 'Nhà Trần', tags: ['tướng quân'] },
    { id: 'khoi-nghia-lam-son', type: 'event', name: 'Khởi nghĩa Lam Sơn', period: '1418-1427', tags: ['kháng chiến'] },
    { id: 'chien-thang-bach-dang', type: 'event', name: 'Chiến thắng Bạch Đằng', period: '1288', tags: ['trận đánh'] }
  ]
}