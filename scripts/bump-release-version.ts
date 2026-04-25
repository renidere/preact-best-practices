import fs from 'node:fs/promises'
import path from 'node:path'
import { repoRoot } from './lib/skill.js'

const manifestPath = path.join(repoRoot, 'src', 'preact-best-practices', 'manifest.yaml')
const dryRun = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const rawManifest = await fs.readFile(manifestPath, 'utf8')
  const currentVersion = readCurrentVersion(rawManifest)
  const nextVersion = bumpPatchVersion(currentVersion)
  const nextDate = formatReleaseDate(new Date())
  const nextManifest = updateManifest(rawManifest, nextVersion, nextDate)

  if (!dryRun) {
    await fs.writeFile(manifestPath, nextManifest, 'utf8')
  }

  process.stdout.write(nextVersion)
}

function readCurrentVersion(rawManifest: string): string {
  const match = rawManifest.match(/^version:\s*([0-9]+\.[0-9]+\.[0-9]+)\s*$/m)

  if (!match?.[1]) {
    throw new Error(`Could not read a semver version from ${manifestPath}`)
  }

  return match[1]
}

function bumpPatchVersion(version: string): string {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/)

  if (!match) {
    throw new Error(`Unsupported manifest version '${version}'. Expected MAJOR.MINOR.PATCH.`)
  }

  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = Number(match[3])

  return `${major}.${minor}.${patch + 1}`
}

function updateManifest(rawManifest: string, nextVersion: string, nextDate: string): string {
  const withNextVersion = replaceRequiredLine(rawManifest, /^version:\s*.*$/m, `version: ${nextVersion}`, 'version')
  return withNextVersion.replace(/^date:\s*.*$/m, `date: ${nextDate}`)
}

function replaceRequiredLine(
  source: string,
  pattern: RegExp,
  replacement: string,
  fieldName: string,
): string {
  if (!pattern.test(source)) {
    throw new Error(`Expected ${fieldName} field in ${manifestPath}`)
  }

  return source.replace(pattern, replacement)
}

function formatReleaseDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

await main()
