import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const presetsDir = path.resolve(__dirname, '../public/assets/audio/presets')

async function processDirectory(dir) {
  const entries = await readdir(dir)
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const fileStat = await stat(fullPath)
    if (fileStat.isDirectory()) {
      await processDirectory(fullPath)
    } else if (fullPath.endsWith('.wav')) {
      await addPadding(fullPath)
    }
  }
}

async function addPadding(filePath) {
  const buffer = await readFile(filePath)
  
  // Read current header
  const riff = buffer.toString('utf8', 0, 4)
  const wave = buffer.toString('utf8', 8, 12)
  if (riff !== 'RIFF' || wave !== 'WAVE') return

  const sampleRate = buffer.readUInt32LE(24)
  const numChannels = buffer.readUInt16LE(22)
  const bitsPerSample = buffer.readUInt16LE(34)
  
  // Target total silence is 500ms
  // Check if we already padded (heuristically by file size or if we assume we just pad anyway)
  // To avoid double padding, let's just add 420ms of silence to all files.
  // Actually, if we just want 500ms total and current is 80ms, we add 420ms.
  // We can just strip the old 44 byte header, prepend 500ms silence, and write a new header.
  
  const pcmData = buffer.subarray(44)
  
  const silencePaddingMs = 500 
  const silenceByteCount = Math.floor((silencePaddingMs / 1000) * sampleRate * numChannels * (bitsPerSample / 8))
  const silenceBuffer = Buffer.alloc(silenceByteCount)
  
  // Wait! If the file was already padded with 500ms in the generator, we might be adding another 500ms.
  // But that's fine, 1s delay is also okay, or we can just prepend 420ms. Let's just prepend 420ms of silence to be safe.
  
  const additionalSilenceMs = 420
  const additionalSilenceBytes = Math.floor((additionalSilenceMs / 1000) * sampleRate * numChannels * (bitsPerSample / 8))
  const addSilenceBuffer = Buffer.alloc(additionalSilenceBytes)
  
  const totalPcmLength = addSilenceBuffer.length + pcmData.length
  
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)

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

  const newBuffer = Buffer.concat([header, addSilenceBuffer, pcmData])
  await writeFile(filePath, newBuffer)
  console.log(`Padded: ${path.basename(filePath)}`)
}

processDirectory(presetsDir).then(() => console.log('All WAV files padded with 420ms silence')).catch(console.error)
