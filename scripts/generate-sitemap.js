#!/usr/bin/env node

/**
 * Sitemap Generator
 * Generates sitemap.xml for HistoryLens AI
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Base URL - change this to your production domain
const BASE_URL = process.env.BASE_URL || 'https://historylens.example.com'

// Static pages
const staticPages = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/learning-paths', changefreq: 'weekly', priority: 0.8 },
]

async function generateSitemap() {
  try {
    // Load manifest to get all entity IDs
    const manifestPath = join(__dirname, '../src/data/manifest.json')
    const manifestContent = await readFile(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestContent)

    // Build entity pages
    const entityPages = manifest.entities.map(entity => ({
      url: `/entity/${entity.id}`,
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: entity.metadata?.lastUpdated || entity.metadata?.createdAt || new Date().toISOString().split('T')[0],
    }))

    // Combine all URLs
    const allUrls = [...staticPages, ...entityPages]

    // Generate XML
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`

    const urlEntries = allUrls.map(entry => `  <url>
    <loc>${BASE_URL}${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')

    const xmlFooter = `</urlset>`

    const sitemap = `${xmlHeader}\n${urlEntries}\n${xmlFooter}`

    // Write to public folder
    const outputPath = join(__dirname, '../public/sitemap.xml')
    await writeFile(outputPath, sitemap, 'utf-8')

    console.log(`✅ Sitemap generated: ${outputPath}`)
    console.log(`   Total URLs: ${allUrls.length}`)
    console.log(`   - Static pages: ${staticPages.length}`)
    console.log(`   - Entity pages: ${entityPages.length}`)
    console.log(`\n📊 Sitemap stats:`)
    console.log(`   BASE_URL: ${BASE_URL}`)
    console.log(`\n💡 Tip: Submit sitemap to Google Search Console`)

  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message)
    process.exit(1)
  }
}

await generateSitemap()
