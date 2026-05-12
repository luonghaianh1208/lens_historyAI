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
import manifest from '../data/manifest.json'
import { PERIODS, getPeriodForEntity as getPeriodFromTimeline } from '../data/timeline'

// Pre-loaded entities (existing full entities)
const rawEntities = {
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
  'dien-bien-phu': dienBienPhu,
}

// Build entity map from manifest + merge with existing full entities
const entityManifestMap = new Map()
manifest.entities.forEach(meta => {
  entityManifestMap.set(meta.id, meta)
})

// Cache for fully loaded entities
const fullEntityCache = new Map()

// Helper: Get entity file path based on ID
function getEntityFilePath(id) {
  // Check if it's a person or event based on manifest
  const meta = entityManifestMap.get(id)
  if (!meta) return null

  // Try common patterns
  const baseName = id.replace(/-/g, '_')
  const paths = [
    `../data/entities/${baseName}.json`,
    `../data/events/${baseName}.json`,
  ]

  // We can't use import.meta.glob in ESM, so we'll try to require dynamically
  // For now, we'll rely on pre-imported entities and manifest-only entities
  return null // Dynamic import not easily done in this setup
}

const mojibakePattern = /[����][\u0080-\u00ff]?/

function repairMojibakeText(value = '') {
  if (!value || !mojibakePattern.test(value)) return value

  try {
    const bytes = Uint8Array.from(Array.from(value, (char) => char.charCodeAt(0) & 0xff))
    const repaired = new TextDecoder('utf-8').decode(bytes)
    return repaired.includes('�') ? value : repaired
  } catch {
    return value
  }
}

function deepRepair(value) {
  if (typeof value === 'string') {
    return repairMojibakeText(value)
  }

  if (Array.isArray(value)) {
    return value.map(deepRepair)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, deepRepair(entry)]))
  }

  return value
}

function normalizePerspectives(perspectives = {}) {
  return Object.fromEntries(
    Object.entries(perspectives).map(([key, value]) => [
      key,
      {
        ...value,
        system_prompt: value.system_prompt || value.instruction || '',
      },
    ]),
  )
}

function normalizeChunks(chunks = []) {
  return chunks.map((chunk, index) => ({
    id: chunk.id || `${chunk.source || chunk.metadata || 'chunk'}-${index}`,
    content: chunk.content || '',
    source: chunk.source || chunk.metadata || 'Tư liệu tổng hợp',
    reliability: chunk.reliability ?? 88,
    tags: chunk.tags || [],
  }))
}

function normalizeEntity(entity) {
  const repaired = deepRepair(entity)

  return {
    ...repaired,
    period: repaired.period || repaired.dynasty || repaired.dates || '',
    short_desc: repaired.short_desc || repaired.shortDescription || repaired.description || '',
    perspectives: normalizePerspectives(repaired.perspectives || {}),
    timeline: repaired.timeline || [],
    chunks: normalizeChunks(repaired.chunks || []),
    tags: repaired.tags || [],
    aliases: repaired.aliases || [],
    roles: repaired.roles || [],
    related_people: repaired.related_people || [],
    related_events: repaired.related_events || [],
  }
}

// Merge manifest metadata with full entity data
function mergeEntityWithManifest(entity, meta) {
  return {
    ...entity,
    // Override/merge with manifest metadata
    status: meta.status || entity.status || 'pending',
    verification: meta.verification || entity.verification,
    metadata: {
      ...entity.metadata,
      ...meta.metadata,
      createdAt: meta.metadata?.createdAt || entity.metadata?.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
    // Ensure required fields from manifest
    tags: [...new Set([...(entity.tags || []), ...(meta.tags || [])])],
    short_desc: entity.short_desc || meta.short_desc || '',
  }
}

// Build entities map: merge pre-loaded entities with manifest entries
const entities = new Map()

// First, add all pre-loaded (full) entities with manifest metadata
Object.entries(rawEntities).forEach(([id, rawEntity]) => {
  const meta = entityManifestMap.get(id)
  const normalized = normalizeEntity(rawEntity)
  if (meta) {
    entities.set(id, mergeEntityWithManifest(normalized, meta))
  } else {
    entities.set(id, normalized)
  }
  fullEntityCache.set(id, entities.get(id))
})

// Then, add manifest-only entities (minimal data until file is created)
manifest.entities.forEach(meta => {
  if (!entities.has(meta.id)) {
    entities.set(meta.id, {
      id: meta.id,
      name: meta.name,
      type: meta.type,
      period: meta.period,
      tags: meta.tags || [],
      short_desc: meta.short_desc || '',
      status: meta.status || 'pending',
      verification: meta.verification || null,
      metadata: meta.metadata || {},
      chunks: [],
      perspectives: {},
      timeline: [],
      aliases: [],
      roles: [],
      related_people: [],
      related_events: [],
    })
  }
})

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

// Export functions
export function getEntity(id) {
  return entities.get(id) || null
}

export function getAllEntities() {
  return Array.from(entities.values())
}

export function searchEntities(query) {
  const q = normalizeText(query)
  if (!q) return []

  return getAllEntities().filter((entity) => {
    const nameMatch = normalizeText(entity.name).includes(q)
    const aliasMatch = entity.aliases?.some((alias) => normalizeText(alias).includes(q))
    const tagMatch = entity.tags?.some((tag) => normalizeText(tag).includes(q))
    const periodMatch = normalizeText(entity.period).includes(q)
    return nameMatch || aliasMatch || tagMatch || periodMatch
  })
}

export function getIndex() {
  return getAllEntities().map((entity) => ({
    id: entity.id,
    type: entity.type,
    name: entity.name,
    period: entity.period,
    tags: entity.tags,
  }))
}

// Timeline-related exports
export function getPeriods() {
  return PERIODS
}

export function getEntitiesByPeriod(periodId) {
  return PERIODS.find(p => p.id === periodId)?.entities || []
}

export function getPeriodForEntity(entityId) {
  return getPeriodFromTimeline(entityId)
}

export function getEntityStatus(id) {
  const entity = getEntity(id)
  return entity?.status || 'pending'
}

export function isEntityVerified(id) {
  const entity = getEntity(id)
  return entity?.verification?.status === 'verified'
}

export function getVerifiedEntities() {
  return getAllEntities().filter(e => e.verification?.status === 'verified')
}

export default {
  getEntity,
  getAllEntities,
  searchEntities,
  getIndex,
  getPeriods,
  getEntitiesByPeriod,
  getPeriodForEntity,
  getEntityStatus,
  isEntityVerified,
  getVerifiedEntities,
}
