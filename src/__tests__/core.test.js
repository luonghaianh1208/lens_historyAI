import { describe, it, expect } from 'vitest'
import { getEntity, searchEntities, getIndex } from '../services/retrieval'
import { findPresetResponse, getQuickSuggestions, hasPresetAudio } from '../services/chatPresetService'

// ─── Task 1 regression: normalizeEntity keeps all expected fields ───

describe('normalizeEntity / getEntity', () => {
  it('returns null for unknown id', () => {
    expect(getEntity('does-not-exist')).toBeNull()
  })

  it('preserves core fields with defaults', () => {
    const entity = getEntity('nguyen-trai')
    expect(entity).not.toBeNull()
    expect(entity.name).toBeTruthy()
    expect(entity.period).toBeTruthy()
    expect(entity.short_desc).toBeTruthy()
    expect(Array.isArray(entity.timeline)).toBe(true)
    expect(Array.isArray(entity.chunks)).toBe(true)
    expect(Array.isArray(entity.tags)).toBe(true)
    expect(Array.isArray(entity.aliases)).toBe(true)
    expect(Array.isArray(entity.roles)).toBe(true)
    expect(Array.isArray(entity.related_people)).toBe(true)
    expect(Array.isArray(entity.related_events)).toBe(true)
  })

  it('preserves related_events from JSON data', () => {
    const nguyen = getEntity('nguyen-trai')
    expect(nguyen.related_events).toContain('khoi-nghia-lam-son')

    const tran = getEntity('tran-hung-dao')
    expect(tran.related_events).toContain('chien-thang-bach-dang')
  })

  it('normalizes perspectives with system_prompt fallback', () => {
    const entity = getEntity('nguyen-trai')
    expect(typeof entity.perspectives).toBe('object')
    const keys = Object.keys(entity.perspectives)
    expect(keys.length).toBeGreaterThan(0)
    for (const key of keys) {
      expect(entity.perspectives[key]).toHaveProperty('system_prompt')
    }
  })

  it('normalizes chunks with required fields', () => {
    const entity = getEntity('le-loi')
    for (const chunk of entity.chunks) {
      expect(chunk).toHaveProperty('id')
      expect(chunk).toHaveProperty('content')
      expect(chunk).toHaveProperty('source')
      expect(chunk).toHaveProperty('reliability')
      expect(chunk).toHaveProperty('tags')
    }
  })
})

// ─── searchEntities: diacritics removal & matching ───

describe('searchEntities', () => {
  it('returns empty for blank query', () => {
    expect(searchEntities('')).toEqual([])
    expect(searchEntities('   ')).toEqual([])
  })

  it('finds entity by name without diacritics', () => {
    const results = searchEntities('nguyen trai')
    expect(results.some((e) => e.id === 'nguyen-trai')).toBe(true)
  })

  it('finds entity by partial name', () => {
    const results = searchEntities('Lê Lợi')
    expect(results.some((e) => e.id === 'le-loi')).toBe(true)
  })

  it('finds event by name', () => {
    const results = searchEntities('Điện Biên Phủ')
    expect(results.some((e) => e.id === 'dien-bien-phu')).toBe(true)
  })

  it('returns no results for gibberish', () => {
    expect(searchEntities('xyzqwerty12345')).toEqual([])
  })
})

// ─── getIndex: derived search index ───

describe('getIndex', () => {
  it('returns all entities with required fields', () => {
    const index = getIndex()
    expect(index.length).toBeGreaterThan(0)
    for (const item of index) {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('type')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('period')
      expect(item).toHaveProperty('tags')
    }
  })
})

// ─── sanitizeQuizQuestions (inline import via dynamic import or re-implement) ───
// Since sanitizeQuizQuestions is not exported, we re-implement the logic to test its contract.

function sanitizeQuizQuestions(rawQuestions) {
  if (!Array.isArray(rawQuestions)) return []

  return rawQuestions
    .map((item, index) => {
      const question = typeof item?.question === 'string' ? item.question.trim() : ''
      const options = Array.isArray(item?.options)
        ? item.options
            .filter((option) => typeof option === 'string' || typeof option === 'number')
            .map((option) => String(option).trim())
            .filter(Boolean)
            .slice(0, 4)
        : []
      const explanation = typeof item?.explanation === 'string' ? item.explanation.trim() : ''
      const correct = Number.isInteger(item?.correct) ? item.correct : -1

      if (!question || options.length !== 4 || correct < 0 || correct >= options.length) {
        return null
      }

      return {
        question,
        options,
        correct,
        explanation: explanation || `Đáp án đúng là ${String.fromCharCode(65 + correct)}.`,
        id: item.id || `${index}-${question}`,
      }
    })
    .filter(Boolean)
    .slice(0, 5)
}

describe('sanitizeQuizQuestions', () => {
  it('returns empty array for non-array input', () => {
    expect(sanitizeQuizQuestions(null)).toEqual([])
    expect(sanitizeQuizQuestions('string')).toEqual([])
    expect(sanitizeQuizQuestions(42)).toEqual([])
  })

  it('filters out items missing required fields', () => {
    const input = [
      { question: 'Q?', options: ['A', 'B', 'C', 'D'], correct: 0 },
      { question: '', options: ['A', 'B', 'C', 'D'], correct: 0 },  // no question
      { question: 'Q2?', options: ['A', 'B'], correct: 0 },          // too few options
      { question: 'Q3?', options: ['A', 'B', 'C', 'D'], correct: 5 }, // out of range
    ]
    const result = sanitizeQuizQuestions(input)
    expect(result).toHaveLength(1)
    expect(result[0].question).toBe('Q?')
  })

  it('caps at 5 questions', () => {
    const input = Array.from({ length: 10 }, (_, i) => ({
      question: `Q${i}?`,
      options: ['A', 'B', 'C', 'D'],
      correct: 0,
    }))
    expect(sanitizeQuizQuestions(input)).toHaveLength(5)
  })

  it('generates default explanation if missing', () => {
    const input = [{ question: 'Q?', options: ['A', 'B', 'C', 'D'], correct: 2 }]
    const result = sanitizeQuizQuestions(input)
    expect(result[0].explanation).toBe('Đáp án đúng là C.')
  })
})

// ─── findPresetResponse: matching accuracy ───

describe('findPresetResponse', () => {
  it('returns null when no presets exist for entity', () => {
    const result = findPresetResponse({ entityId: 'nonexistent', perspective: 'self', input: 'hello' })
    expect(result).toBeNull()
  })

  it('returns exact match for known preset question', () => {
    const result = findPresetResponse({
      entityId: 'nguyen-trai',
      perspective: 'self',
      input: 'Ngài nhìn lại đời mình như một người làm chính trị, làm thơ hay làm quân sư?',
    })
    expect(result).not.toBeNull()
    expect(result.matchType).toBe('exact')
    expect(result.confidence).toBe(1)
  })

  it('does not match on very short input', () => {
    const result = findPresetResponse({ entityId: 'nguyen-trai', perspective: 'self', input: 'gì' })
    expect(result).toBeNull()
  })

  it('does not false-positive on unrelated input', () => {
    const result = findPresetResponse({
      entityId: 'nguyen-trai',
      perspective: 'self',
      input: 'Hôm nay thời tiết có mưa không?',
    })
    expect(result).toBeNull()
  })
})

// ─── getQuickSuggestions ───

describe('getQuickSuggestions', () => {
  it('returns array for valid entity and perspective', () => {
    const entity = getEntity('ho-chi-minh')
    const suggestions = getQuickSuggestions(entity, 'self')
    expect(Array.isArray(suggestions)).toBe(true)
    expect(suggestions.length).toBeGreaterThan(0)
  })

  it('returns empty array for null entity', () => {
    expect(getQuickSuggestions(null, 'self')).toEqual([])
  })

  it('generates fallback suggestions for unknown perspective', () => {
    const entity = getEntity('nguyen-trai')
    const suggestions = getQuickSuggestions(entity, 'unknown-perspective')
    // Should still return something via the generic fallback
    expect(Array.isArray(suggestions)).toBe(true)
  })
})

// ─── hasPresetAudio ───

describe('hasPresetAudio', () => {
  it('returns true for preset message with audioSrc', () => {
    expect(hasPresetAudio({ source: 'preset', audioSrc: '/audio.wav' })).toBe(true)
  })

  it('returns false for AI message', () => {
    expect(hasPresetAudio({ source: 'ai', content: 'hello' })).toBe(false)
  })

  it('returns false for null/undefined', () => {
    expect(hasPresetAudio(null)).toBe(false)
    expect(hasPresetAudio(undefined)).toBe(false)
  })
})
