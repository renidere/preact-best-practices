import path from 'node:path'
import fs from 'node:fs/promises'
import { distDir, loadSourceSkill, repoRoot } from './lib/skill.js'

const installParents = ['.agents/skills', '.claude/skills', '.opencode/skills']

async function main(): Promise<void> {
  const skill = await loadSourceSkill()

  try {
    await fs.access(distDir)
  } catch {
    throw new Error(`Built artifact not found at ${distDir}. Run 'npm run build:skill' first.`)
  }

  for (const parent of installParents) {
    const installDir = path.join(repoRoot, parent)
    const target = path.join(installDir, skill.manifest.name)

    await fs.mkdir(installDir, { recursive: true })
    await ensureSymlink(distDir, target)
    console.log(`Linked ${target} -> ${distDir}`)
  }
}

async function ensureSymlink(source: string, target: string): Promise<void> {
  try {
    const stat = await fs.lstat(target)
    if (stat.isSymbolicLink()) {
      const linked = await fs.readlink(target)
      const resolved = path.resolve(path.dirname(target), linked)
      if (resolved === source) {
        return
      }
      await fs.rm(target, { force: true })
    } else {
      throw new Error(`Refusing to replace non-symlink path: ${target}`)
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }

  await fs.symlink(source, target, 'dir')
}

await main()
