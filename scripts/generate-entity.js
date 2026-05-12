#!/usr/bin/env node

/**
 * Entity Generator Script
 *
 * Usage: node generate-entity.js [entityId]
 *
 * This script uses Claude API to generate complete entity content
 * based on the manifest entry. It creates the full entity JSON file
 * with chunks, perspectives, timeline, etc.
 *
 * Prerequisites:
 * - ANTHROPIC_API_KEY environment variable must be set
 *
 * Example:
 *   ANTHROPIC_API_KEY=your_key node generate-entity.js ho-chi-minh
 */

import { Anthropic } from '@anthropic-ai/sdk'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load manifest
const manifestPath = join(__dirname, '../src/data/manifest.json')
const manifestContent = await readFile(manifestPath, 'utf-8')
const manifest = JSON.parse(manifestContent)

// Entity ID từ command line
const entityId = process.argv[2]

if (!entityId) {
  console.error('Error: Please provide an entity ID')
  console.error('Usage: node generate-entity.js [entityId]')
  console.error('\nExample entity IDs:')
  manifest.entities.slice(0, 10).forEach(e => {
    console.error(`  - ${e.id}: ${e.name}`)
  })
  process.exit(1)
}

// Find entity in manifest
const meta = manifest.entities.find(e => e.id === entityId)

if (!meta) {
  console.error(`Error: Entity "${entityId}" not found in manifest`)
  console.error('\nAvailable entities:')
  manifest.entities.forEach(e => {
    console.error(`  - ${e.id}: ${e.name}`)
  })
  process.exit(1)
}

console.log(`Generating content for: ${meta.name} (${meta.id})`)
console.log(`Type: ${meta.type}, Period: ${meta.period}`)

// Check API key
const apiKey = process.env.ANTHROPIC_API_KEY

if (!apiKey) {
  console.error('\nError: ANTHROPIC_API_KEY environment variable not set')
  console.error('Please set it:')
  console.error('  export ANTHROPIC_API_KEY=your_key_here')
  console.error('  (on Windows: set ANTHROPIC_API_KEY=your_key_here)')
  process.exit(1)
}

const anthropic = new Anthropic({ apiKey })

// Build system prompt for entity generation
function buildSystemPrompt(meta) {
  const typeText = meta.type === 'person' ? 'nhân vật' : 'sự kiện'
  const periodContext = meta.period

  return `Bạn là một chuyên gia lịch sử Việt Nam. Nhiệm vụ của bạn là tạo nội dung chi tiết, chính xác về ${typeText} "${meta.name}" trong bối cảnh: ${periodContext}.

YÊU CẦU VỀ ĐỘ CHÍNH XÁC:
- Chỉ sử dụng thông tin có thể xác minh được từ sử liệu lịch sử Việt Nam
- Ngày tháng, năm phải chính xác
- Không được bịa đặt thông tin
- Nếu không chắc chắn về chi tiết nào, hãy ghi "[Cần xác minh]" hoặc bỏ qua

CẤU TRÚC OUTPUT (JSON CHỈ):
{
  "id": "${meta.id}",
  "name": "${meta.name}",
  "type": "${meta.type}",
  "description": "Mô tả tổng quan về ${typeText} (~150 từ)",
  "shortDescription": "Tóm tắt ngắn gọn (~50 từ)",
  "period": "${meta.period}",
  "dates": "Niên đại cụ thể (VD: "1890 - 1969" hoặc "938 - 1945")",
  "tags": ["tag1", "tag2", "tag3"],
  "aliases": ["biệt danh", "tên khác", ...],
  "roles": ["Vai trò", "Chức vụ", ...],
  "timeline": [
    {
      "year": "YYYY",
      "event": "Tên sự kiện",
      "description": "Mô tả ngắn về sự kiện (50-80 từ)"
    }
  ],
  "chunks": [
    {
      "id": "chunk_1",
      "content": "Đoạn văn bản về ${typeText} (~120-150 từ). Phải có thông tin cụ thể, có thể trích dẫn nguồn tư liệu.",
      "source": {
        "type": "book | document | article | website",
        "title": "Tên sách/tư liệu",
        "author": "Tác giả nếu có",
        "year": "Năm xuất bản",
        "publisher": "Nhà xuất bản",
        "url": "URL nếu là website",
        "page": "Số trang nếu có"
      },
      "reliability": 85,
      "tags": ["chủ đề", "từ khóa"]
    }
  ],
  "related_people": [
    {"id": "entity_id", "name": "Tên nhân vật", "relationship": "Mối quan hệ"}
  ],
  "related_events": [
    {"id": "event_id", "name": "Tên sự kiện", "relationship": "Mối quan hệ"}
  ],
  "perspectives": {
    "self": {
      "persona": "${meta.name}",
      "voice_name": "Charon",
      "system_prompt": "Hướng dẫn giọng văn khi nhập vai chính nhân vật này. Giọng điệu, cách xưng hô, quan điểm."
    },
    "contemporary": {
      "persona": "Người dân cùng thời",
      "voice_name": "Kore",
      "system_prompt": "Hướng dẫn giọng văn từ góc nhìn người dân thời đó."
    },
    "historian": {
      "persona": "Sử gia hiện đại",
      "voice_name": "Aoede",
      "system_prompt": "Hướng dẫn giọng văn khách quan, phân tích từ góc nhìn sử học."
    }
  }
}

QUY TẮC:
1. Timeline: 5-7 mốc quan trọng nhất, từ sớm nhất đến muộn nhất
2. Chunks: 8-10 đoạn, mỗi đoạn 120-150 từ, có source cụ thể
3. Sources: Ưu tiên sách giáo khoa, tư liệu lịch sử chính thống
4. Reliability: Đánh giá 0-100 cho mỗi chunk (90+ cho source tốt, 70-80 cho source thông thường)
5. Perspectives: Viết system prompt bằng tiếng Việt, mô tả cách nhân vật/giọng nói nên trả lời
6. Không được để trống bất kỳ field nào (dùng default nếu không có thông tin)
7. Tất cả dates phải là string, không phải number
8. IDs phải là snake_case, không dấu

Hãy tạo JSON CHỈ, không có text nào khác.`
}

async function generateEntity(meta) {
  const systemPrompt = buildSystemPrompt(meta)

  console.log('\nCalling Claude API...')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 8000,
      temperature: 0.8,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Hãy tạo nội dung đầy đủ cho ${meta.type === 'person' ? 'nhân vật' : 'sự kiện'} "${meta.name}" theo cấu trúc JSON đã cho.`
        }
      ]
    })

    const content = response.content[0].text

    // Extract JSON from response (Claude might add explanations)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const entityData = JSON.parse(jsonMatch[0])

    // Validate required fields
    const requiredFields = ['id', 'name', 'type', 'description', 'chunks', 'perspectives']
    for (const field of requiredFields) {
      if (!entityData[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Ensure ID matches
    if (entityData.id !== meta.id) {
      console.warn(`Warning: ID mismatch (expected ${meta.id}, got ${entityData.id})`)
      entityData.id = meta.id
    }

    // Add verification metadata
    entityData.verification = {
      status: 'ai_generated',
      confidence: 0.75, // AI-generated content needs human review
      generatedAt: new Date().toISOString(),
      model: 'claude-opus-4-6',
    }

    entityData.metadata = {
      createdBy: 'ai',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    return entityData

  } catch (error) {
    console.error('Error generating entity:', error.message)
    if (error.response) {
      console.error('API Response:', error.response)
    }
    throw error
  }
}

async function saveEntity(entityData) {
  const isEvent = entityData.type === 'event'
  const fileName = entityData.id.replace(/-/g, '_')
  const subDir = isEvent ? 'events' : 'entities'
  const filePath = join(__dirname, `../src/data/${subDir}/${fileName}.json`)

  // Ensure directory exists
  await mkdir(join(__dirname, `../src/data/${subDir}`), { recursive: true })

  await writeFile(filePath, JSON.stringify(entityData, null, 2), 'utf-8')
  console.log(`✓ Saved to: ${filePath}`)

  return filePath
}

async function updateManifest(entityData) {
  // Update manifest entry
  const metaIndex = manifest.entities.findIndex(e => e.id === entityData.id)
  if (metaIndex !== -1) {
    manifest.entities[metaIndex].status = 'ai_generated'
    manifest.entities[metaIndex].chunksCount = entityData.chunks?.length || 0
    manifest.entities[metaIndex].sourceCount = entityData.chunks?.filter(c => c.source)?.length || 0
    manifest.entities[metaIndex].verification = {
      status: 'pending_review',
      confidence: entityData.verification?.confidence,
      lastChecked: new Date().toISOString(),
    }
    manifest.lastUpdated = new Date().toISOString()
  }

  const manifestPath = join(__dirname, '../src/data/manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
  console.log(`✓ Updated manifest`)
}

// Main execution
async function main() {
  try {
    const entityData = await generateEntity(meta)
    await saveEntity(entityData)
    await updateManifest(entityData)

    console.log('\n✅ Entity generation complete!')
    console.log(`\nNext steps:`)
    console.log(`1. Review the generated file: src/data/${meta.type === 'event' ? 'events' : 'entities'}/${meta.id.replace(/-/g, '_')}.json`)
    console.log(`2. Verify the content accuracy`)
    console.log(`3. Update manifest status to "verified" after review`)

  } catch (error) {
    console.error('\n❌ Generation failed:', error.message)
    process.exit(1)
  }
}

await main()
