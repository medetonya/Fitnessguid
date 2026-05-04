import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const normalizeExerciseName = (value) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const videoLibraryPath = path.join(root, 'src/data/exerciseVideoLibrary.ts')
const workoutBuilderPath = path.join(root, 'src/data/workoutBuilderExercises.ts')
const videosDir = path.join(root, 'public/videos')

const videoLibraryText = fs.readFileSync(videoLibraryPath, 'utf8')
const workoutBuilderText = fs.readFileSync(workoutBuilderPath, 'utf8')

const extractObjectBlock = (text, anchor) => {
  const anchorIndex = text.indexOf(anchor)
  if (anchorIndex < 0) {
    return ''
  }

  const openIndex = text.indexOf('{', anchorIndex)
  if (openIndex < 0) {
    return ''
  }

  let depth = 0
  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '{') {
      depth += 1
    } else if (ch === '}') {
      depth -= 1
      if (depth === 0) {
        return text.slice(openIndex + 1, i)
      }
    }
  }

  return ''
}

const parseVideoMappings = (blockText) => {
  const map = new Map()
  const regex = /\[normalizeExerciseName\('([^']+)'\)\]\s*:\s*'([^']+)'/g
  let match = regex.exec(blockText)
  while (match) {
    map.set(normalizeExerciseName(match[1]), match[2])
    match = regex.exec(blockText)
  }
  return map
}

const parseAliases = (blockText) => {
  const aliases = new Map()
  const duplicateKeys = new Map()
  const regex = /\[normalizeExerciseName\('([^']+)'\)\]\s*:\s*normalizeExerciseName\('([^']+)'\)/g
  let match = regex.exec(blockText)
  while (match) {
    const key = normalizeExerciseName(match[1])
    const target = normalizeExerciseName(match[2])
    if (aliases.has(key)) {
      duplicateKeys.set(key, (duplicateKeys.get(key) ?? 1) + 1)
    }
    aliases.set(key, target)
    match = regex.exec(blockText)
  }
  return { aliases, duplicateKeys }
}

const videoMapBlock = extractObjectBlock(videoLibraryText, 'const exerciseVideoMap')
const sharedBlock = extractObjectBlock(videoMapBlock, 'shared:')
const homeBlock = extractObjectBlock(videoMapBlock, 'home:')
const gymBlock = extractObjectBlock(videoMapBlock, 'gym:')
const aliasBlock = extractObjectBlock(videoLibraryText, 'const exerciseVideoAliases')

const sharedMap = parseVideoMappings(sharedBlock)
const homeMap = parseVideoMappings(homeBlock)
const gymMap = parseVideoMappings(gymBlock)
const { aliases, duplicateKeys } = parseAliases(aliasBlock)

const allCanonicalKeys = new Set([...sharedMap.keys(), ...homeMap.keys(), ...gymMap.keys()])

const allVideoPaths = new Set()
for (const videoPath of [...sharedMap.values(), ...homeMap.values(), ...gymMap.values()]) {
  allVideoPaths.add(videoPath)
}

const missingVideoFiles = [...allVideoPaths]
  .filter((videoPath) => !fs.existsSync(path.join(root, 'public', videoPath.replace(/^\//, ''))))
  .sort((a, b) => a.localeCompare(b))

const unresolvedAliasTargets = [...aliases.entries()]
  .filter(([, target]) => !allCanonicalKeys.has(target))
  .map(([alias, target]) => ({ alias, target }))

const workoutNameRegex = /name:\s*'([^']+)'/g
const workoutNames = new Set()
let nameMatch = workoutNameRegex.exec(workoutBuilderText)
while (nameMatch) {
  workoutNames.add(nameMatch[1])
  nameMatch = workoutNameRegex.exec(workoutBuilderText)
}

const unmappedWorkoutExercises = [...workoutNames]
  .filter((name) => {
    const normalized = normalizeExerciseName(name)
    const canonical = aliases.get(normalized) ?? normalized
    return !allCanonicalKeys.has(canonical)
  })
  .sort((a, b) => a.localeCompare(b))

console.log('Video Mapping Audit')
console.log('===================')
console.log(`Mapped canonical exercises: ${allCanonicalKeys.size}`)
console.log(`Aliases: ${aliases.size}`)
console.log(`Mapped video files: ${allVideoPaths.size}`)
console.log(`Workout exercises discovered: ${workoutNames.size}`)

if (missingVideoFiles.length > 0) {
  console.log('\nMissing video files:')
  for (const item of missingVideoFiles) {
    console.log(`- ${item}`)
  }
}

if (unresolvedAliasTargets.length > 0) {
  console.log('\nAliases pointing to missing canonical targets:')
  for (const item of unresolvedAliasTargets) {
    console.log(`- ${item.alias} -> ${item.target}`)
  }
}

if (unmappedWorkoutExercises.length > 0) {
  console.log('\nWorkout exercises without mapped video (direct or alias):')
  for (const item of unmappedWorkoutExercises) {
    console.log(`- ${item}`)
  }
}

if (duplicateKeys.size > 0) {
  console.log('\nWarning: duplicate alias keys (later definitions override earlier ones):')
  for (const [key, count] of [...duplicateKeys.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`- ${key} (${count} definitions)`)
  }
}

const hasErrors = missingVideoFiles.length > 0 || unresolvedAliasTargets.length > 0 || unmappedWorkoutExercises.length > 0
if (hasErrors) {
  process.exitCode = 1
} else {
  console.log('\nAudit passed with no blocking issues.')
}
