import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPresetCatalog } from '../src/services/chatPresetService.js'
import { buildStyledTTSText, getPresetTTSStyle, getVoiceConfig } from '../src/services/ttsService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const envPath = path.join(projectRoot, '.env')

function parseEnvFile(content = '') {
  const pairs = {}
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) continue
    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
    pairs[key] = value
  }
  return pairs
}

async function loadApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY

  try {
    const envContent = await readFile(envPath, 'utf8')
    const env = parseEnvFile(envContent)
    return env.GEMINI_API_KEY || ''
  } catch {
    return ''
  }
}

function pcmBase64ToWavBuffer(base64Pcm) {
  const pcmBuffer = Buffer.from(base64Pcm, 'base64')
  const sampleRate = 24000
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const silencePaddingMs = 500 // Increased delay
  const silenceByteCount = Math.floor((silencePaddingMs / 1000) * sampleRate * numChannels * (bitsPerSample / 8))
  const silenceBuffer = Buffer.alloc(silenceByteCount)
  const totalPcmLength = silenceByteCount + pcmBuffer.length

  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + totalPcmLength, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(numChannels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bitsPerSample, 34)
  header.write('data', 36)
  header.writeUInt32LE(totalPcmLength, 40)

  return Buffer.concat([header, silenceBuffer, pcmBuffer])
}

async function fileExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function generateAudioBuffer({ text, voiceName, apiKey }) {
  const payload = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName,
          },
        },
      },
    },
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini TTS API error: ${errorText}`)
  }

  const data = await response.json()
  const parts = data?.candidates?.[0]?.content?.parts || []
  const audioPart = parts.find((part) => part.inlineData?.mimeType?.startsWith('audio/'))
  if (!audioPart?.inlineData?.data) {
    throw new Error('Gemini did not return audio data')
  }

  return pcmBase64ToWavBuffer(audioPart.inlineData.data)
}

function getPromptVariants(item) {
  const style = getPresetTTSStyle(item.entityId, item.perspective)

  return [
    buildStyledTTSText(item.answer, { entityId: item.entityId, perspective: item.perspective }),
    `Đọc đoạn sau bằng tiếng Việt rõ ràng, tự nhiên, có màu sắc lịch sử. ${style}\n\n${item.answer}`,
    item.answer,
  ]
}

async function generateAudioWithRetry(item, apiKey) {
  const voice = getVoiceConfig(item.entityId)
  const promptVariants = getPromptVariants(item)
  let lastError = null

  for (const text of promptVariants) {
    try {
      return await generateAudioBuffer({
        text,
        voiceName: voice.voiceName,
        apiKey,
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Unknown TTS generation error')
}

function getPresetItems() {
  const catalog = getPresetCatalog()
  const items = []

  for (const [entityId, perspectives] of Object.entries(catalog)) {
    for (const [perspective, entries] of Object.entries(perspectives)) {
      for (const entry of entries) {
        items.push({ entityId, perspective, ...entry })
      }
    }
  }

  return items
}

async function main() {
  const apiKey = await loadApiKey()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Set it in environment or .env before generating preset audio.')
  }

  const forceRegen = process.argv.includes('--force')
  const presetItems = getPresetItems()
  let generatedCount = 0
  let skippedCount = 0
  const failedItems = []

  for (const item of presetItems) {
    const relativeAudioPath = item.audioSrc.replace(/^\//, '').replace(/\//g, path.sep)
    const outputPath = path.join(projectRoot, 'public', relativeAudioPath)
    const outputDir = path.dirname(outputPath)

    await mkdir(outputDir, { recursive: true })

    if (!forceRegen && await fileExists(outputPath)) {
      skippedCount += 1
      console.log(`Skip existing: ${item.id}`)
      continue
    }

    try {
      const audioBuffer = await generateAudioWithRetry(item, apiKey)
      await writeFile(outputPath, audioBuffer)
      generatedCount += 1
      console.log(`Generated: ${item.id}`)
    } catch (error) {
      failedItems.push(item.id)
      console.error(`Failed: ${item.id} -> ${error.message || error}`)
    }
  }

  console.log(`Done. Generated ${generatedCount} preset audio files, skipped ${skippedCount}.`)
  if (failedItems.length > 0) {
    console.log(`Still failed (${failedItems.length}): ${failedItems.join(', ')}`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error.message || error)
  process.exitCode = 1
})
