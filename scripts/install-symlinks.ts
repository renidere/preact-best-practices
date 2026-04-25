import path from 'node:path'
import fs from 'node:fs/promises'
import { distDir, loadSourceSkill, repoRoot } from './lib/skill.js'

// Dev-only helper: link the built skill into repo-local test folders.

type InstallTarget = {
  id: string
  localTestParent?: string
}

async function main(): Promise<void> {
  const skill = await loadSourceSkill()
  const installTargets = await loadInstallTargets()

  try {
    await fs.access(distDir)
  } catch {
    throw new Error(`Built artifact not found at ${distDir}. Run 'npm run build:skill' first.`)
  }

  for (const parent of installTargets.map((target) => target.localTestParent).filter(isDefined)) {
    const installDir = path.join(repoRoot, parent)
    const target = path.join(installDir, skill.manifest.name)

    await fs.mkdir(installDir, { recursive: true })
    await ensureSymlink(distDir, target)
    console.log(`Linked local test install ${target} -> ${distDir}`)
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

async function loadInstallTargets(): Promise<InstallTarget[]> {
  const configPath = path.join(repoRoot, 'config', 'install-targets.json')
  const rawConfig = await fs.readFile(configPath, 'utf8')
  const parsed = JSON.parse(rawConfig) as { targets?: InstallTarget[] }

  if (!Array.isArray(parsed.targets)) {
    throw new Error(`Expected install targets in ${configPath}`)
  }

  return parsed.targets
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

await main()
