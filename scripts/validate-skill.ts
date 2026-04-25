import fs from 'node:fs/promises'
import path from 'node:path'
import { loadSourceSkill, repoRoot, validateSourceSkill } from './lib/skill.js'

async function main(): Promise<void> {
  const skill = await loadSourceSkill()
  const errors = validateSourceSkill(skill)
  const packageVersion = await readPackageVersion()

  if (!packageVersion) {
    errors.push('package.json: version is required')
  } else if (packageVersion !== skill.manifest.version) {
    errors.push(
      `package.json: version (${packageVersion}) must match src/preact-best-practices/manifest.yaml version (${skill.manifest.version})`,
    )
  }

  if (errors.length > 0) {
    console.error('Skill validation failed:')
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exitCode = 1
    return
  }

  console.log(`Skill source is valid: ${skill.manifest.name}@${skill.manifest.version}`)
}

async function readPackageVersion(): Promise<string> {
  const packageJsonPath = path.join(repoRoot, 'package.json')
  const rawPackageJson = await fs.readFile(packageJsonPath, 'utf8')
  const packageJson = JSON.parse(rawPackageJson) as { version?: string }
  return packageJson.version?.trim() ?? ''
}

await main()
