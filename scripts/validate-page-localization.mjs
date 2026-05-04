import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const PAGES_DIR = path.join(ROOT, 'src', 'pages')

const allowedLinePatterns = [
  /isRussian/,
  /useRussian/,
  /language\s*===\s*'ru'/,
  /if\s*\(!\s*(useRussian|isRussian)\s*\)/,
  /if\s*\(!\s*(useRussian|isRussian)\s*\)\s*return/,
  /\bt\(/,
  /toLocaleDateString\(/,
  /localize[A-Za-z]+\(/,
  /const\s+\w+Ru\s*=/,
  /const\s+\w+En\s*=/,
  /monthTitle/,
  /locale/,
  /\?\s*'/,
  /:\s*'/,
]

const allowedFilePatterns = [
  /const\s+checklistItems\s*=\s*isRussian\s*\?/,
  /const\s+cards\s*=\s*isRussian\s*\?/,
]

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
      continue
    }

    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

function isAllowedLine(line) {
  return allowedLinePatterns.some((pattern) => pattern.test(line))
}

function fileHasAllowedBlock(content) {
  return allowedFilePatterns.some((pattern) => pattern.test(content))
}

const files = walk(PAGES_DIR)
const findings = []

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/)
  const hasCyrillic = /[А-Яа-яЁё]/.test(content)

  if (!hasCyrillic) {
    continue
  }

  const hasLanguageHook = /useLanguage\(/.test(content) || /useLanguage\b/.test(content)
  if (!hasLanguageHook) {
    findings.push({ filePath, lineNumber: 1, line: 'Cyrillic text exists, but useLanguage is not used in this file.' })
    continue
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (!/[А-Яа-яЁё]/.test(line)) {
      continue
    }

    if (isAllowedLine(line)) {
      continue
    }

    // Allow lines that are part of a nearby language-guarded object or ternary block.
    const start = Math.max(0, index - 20)
    const end = Math.min(lines.length - 1, index + 20)
    const windowText = lines.slice(start, end + 1).join('\n')

    if (isAllowedLine(windowText) || fileHasAllowedBlock(windowText)) {
      continue
    }

    findings.push({ filePath, lineNumber: index + 1, line: line.trim() })
  }
}

if (findings.length > 0) {
  console.error('Localization validation failed. Found potentially hardcoded Russian text:')
  for (const finding of findings) {
    const relPath = path.relative(ROOT, finding.filePath)
    console.error(`- ${relPath}:${finding.lineNumber} -> ${finding.line}`)
  }
  process.exit(1)
}

console.log('Localization validation passed: no unguarded Russian text in page components.')
