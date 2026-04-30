import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPresetCatalog } from '../src/services/chatPresetService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const presetsDir = path.join(projectRoot, 'public', 'assets', 'audio', 'presets')

// ─── WAV header parsing ───

function parseWavHeader(buffer) {
  if (buffer.length < 44) return { valid: false, reason: 'File too small for WAV header' }
  
  const riff = buffer.toString('ascii', 0, 4)
  const wave = buffer.toString('ascii', 8, 12)
  if (riff !== 'RIFF' || wave !== 'WAVE') {
    return { valid: false, reason: `Invalid header: RIFF=${riff}, WAVE=${wave}` }
  }

  const fmt = buffer.toString('ascii', 12, 16)
  if (fmt !== 'fmt ') return { valid: false, reason: `Missing fmt chunk: got "${fmt}"` }

  const audioFormat = buffer.readUInt16LE(20)
  const numChannels = buffer.readUInt16LE(22)
  const sampleRate = buffer.readUInt32LE(24)
  const bitsPerSample = buffer.readUInt16LE(34)

  const dataChunkTag = buffer.toString('ascii', 36, 40)
  const dataSize = buffer.readUInt32LE(40)
  const durationSeconds = dataSize / (sampleRate * numChannels * (bitsPerSample / 8))

  return {
    valid: true,
    audioFormat,
    numChannels,
    sampleRate,
    bitsPerSample,
    dataChunkTag,
    dataSize,
    durationSeconds: Math.round(durationSeconds * 10) / 10,
    fileSizeBytes: buffer.length,
  }
}

// ─── Collect all expected audio paths from catalog ───

function getExpectedFiles() {
  const catalog = getPresetCatalog()
  const expected = []

  for (const [entityId, perspectives] of Object.entries(catalog)) {
    for (const [perspective, entries] of Object.entries(perspectives)) {
      for (const entry of entries) {
        expected.push({
          id: entry.id,
          entityId,
          perspective,
          question: entry.question.slice(0, 60) + (entry.question.length > 60 ? '...' : ''),
          relativePath: entry.audioSrc.replace(/^\//, ''),
          absolutePath: path.join(projectRoot, 'public', entry.audioSrc.replace(/^\//, '').replace(/\//g, path.sep)),
        })
      }
    }
  }
  return expected
}

// ─── Main QA ───

async function main() {
  const expected = getExpectedFiles()
  const results = { pass: [], warn: [], fail: [] }

  console.log(`\n🔍 Kiểm tra ${expected.length} preset audio files...\n`)

  for (const item of expected) {
    try {
      const buffer = await readFile(item.absolutePath)
      const info = parseWavHeader(buffer)

      if (!info.valid) {
        results.fail.push({ id: item.id, reason: info.reason })
        continue
      }

      const issues = []

      // Duration check: preset answers should be ~10-90 seconds
      if (info.durationSeconds < 3) issues.push(`Quá ngắn: ${info.durationSeconds}s`)
      if (info.durationSeconds > 120) issues.push(`Quá dài: ${info.durationSeconds}s`)

      // Sample rate check
      if (info.sampleRate !== 24000) issues.push(`Sample rate bất thường: ${info.sampleRate}Hz`)

      // Channels check
      if (info.numChannels !== 1) issues.push(`Channels: ${info.numChannels} (expected mono)`)

      // PCM check
      if (info.audioFormat !== 1) issues.push(`Audio format: ${info.audioFormat} (expected 1=PCM)`)

      if (issues.length > 0) {
        results.warn.push({ id: item.id, duration: info.durationSeconds, issues })
      } else {
        results.pass.push({ id: item.id, duration: info.durationSeconds, sizeKB: Math.round(info.fileSizeBytes / 1024) })
      }
    } catch (err) {
      results.fail.push({ id: item.id, reason: `File not found or unreadable: ${err.message}` })
    }
  }

  // ─── Print report ───

  console.log(`✅ PASS: ${results.pass.length}`)
  console.log(`⚠️  WARN: ${results.warn.length}`)
  console.log(`❌ FAIL: ${results.fail.length}`)
  console.log()

  if (results.warn.length > 0) {
    console.log('─── Warnings ───')
    for (const w of results.warn) {
      console.log(`  ⚠️  ${w.id} (${w.duration}s) → ${w.issues.join(', ')}`)
    }
    console.log()
  }

  if (results.fail.length > 0) {
    console.log('─── Failures ───')
    for (const f of results.fail) {
      console.log(`  ❌ ${f.id} → ${f.reason}`)
    }
    console.log()
  }

  // Duration distribution
  const allDurations = [...results.pass, ...results.warn].map(r => r.duration).filter(Boolean).sort((a, b) => a - b)
  if (allDurations.length > 0) {
    const min = allDurations[0]
    const max = allDurations[allDurations.length - 1]
    const avg = Math.round((allDurations.reduce((s, d) => s + d, 0) / allDurations.length) * 10) / 10
    const median = allDurations[Math.floor(allDurations.length / 2)]

    console.log('─── Duration Distribution ───')
    console.log(`  Min: ${min}s | Max: ${max}s | Avg: ${avg}s | Median: ${median}s`)
    
    const buckets = { '0-10s': 0, '10-20s': 0, '20-30s': 0, '30-45s': 0, '45-60s': 0, '60s+': 0 }
    for (const d of allDurations) {
      if (d < 10) buckets['0-10s']++
      else if (d < 20) buckets['10-20s']++
      else if (d < 30) buckets['20-30s']++
      else if (d < 45) buckets['30-45s']++
      else if (d < 60) buckets['45-60s']++
      else buckets['60s+']++
    }
    console.log('  Distribution:', Object.entries(buckets).map(([k, v]) => `${k}: ${v}`).join(' | '))
  }

  console.log()
  process.exitCode = results.fail.length > 0 ? 1 : 0
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
