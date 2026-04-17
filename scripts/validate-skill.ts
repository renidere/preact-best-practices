import { loadSourceSkill, validateSourceSkill } from './lib/skill.js'

async function main(): Promise<void> {
  const skill = await loadSourceSkill()
  const errors = validateSourceSkill(skill)

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

await main()
