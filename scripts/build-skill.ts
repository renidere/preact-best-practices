import path from 'node:path'
import fs from 'node:fs/promises'
import {
  copyRuntimeFiles,
  distDir,
  ensureEmptyDir,
  loadSourceSkill,
  renderFullGuide,
  renderRuleIndex,
  renderSkill,
  validateSourceSkill,
} from './lib/skill.js'

async function main(): Promise<void> {
  const skill = await loadSourceSkill()
  const errors = validateSourceSkill(skill)

  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }

  await ensureEmptyDir(distDir)
  await copyRuntimeFiles(skill, distDir)

  await fs.writeFile(path.join(distDir, 'SKILL.md'), `${renderSkill(skill)}\n`, 'utf8')
  await fs.writeFile(
    path.join(distDir, 'references', 'full-guide.md'),
    `${renderFullGuide(skill)}\n`,
    'utf8',
  )
  await fs.writeFile(
    path.join(distDir, 'references', 'rule-index.md'),
    `${renderRuleIndex(skill)}\n`,
    'utf8',
  )

  console.log(`Built skill artifact at ${distDir}`)
}

await main()
