#!/usr/bin/env node

import { constants as fsConstants } from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const installMetadataFile = '.preact-best-practices-install.json'
const skillName = 'preact-best-practices'
const binDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(binDir, '..')

let packageJson
let bundledSkillDir
let targetDefinitions
let managedPackageNames

async function initModuleState() {
  packageJson = await readPackageJson()
  bundledSkillDir = path.join(packageRoot, 'dist', skillName)
  targetDefinitions = await readInstallTargets()
  managedPackageNames = new Set([packageJson.name, 'preact-best-practices-opencode'])
}

async function main() {
  await initModuleState()

  const cli = parseCli(process.argv.slice(2))

  if (cli.help) {
    printHelp()
    return
  }

  if (cli.detected && cli.command !== 'targets') {
    throw new Error(`'--detected' is only supported with the 'targets' command.`)
  }

  if (cli.command === 'targets') {
    await printTargets(cli.detected)
    return
  }

  const installPlans = await resolveInstallPlans(cli)

  switch (cli.command) {
    case 'install':
      for (const plan of installPlans) {
        await installSkill(plan)
      }
      return
    case 'status':
      await printStatus(installPlans)
      return
    case 'uninstall':
      for (const plan of installPlans) {
        await uninstallSkill(plan, cli.force)
      }
      return
    default:
      throw new Error(
        `Unsupported command '${cli.command}'. Use 'install', 'status', 'targets', or 'uninstall'.`,
      )
  }
}

function parseCli(args) {
  const options = {
    command: 'install',
    targets: [],
    configDir: undefined,
    skillsDir: undefined,
    force: false,
    help: false,
    all: false,
    auto: false,
    detected: false,
  }

  const positionals = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }

    if (arg === '--force') {
      options.force = true
      continue
    }

    if (arg === '--all') {
      options.all = true
      continue
    }

    if (arg === '--auto') {
      options.auto = true
      continue
    }

    if (arg === '--detected') {
      options.detected = true
      continue
    }

    if (arg === '--target') {
      const value = args[index + 1]
      if (!value) {
        throw new Error(`Missing value for ${arg}`)
      }

      addTargets(options.targets, value)
      index += 1
      continue
    }

    if (arg.startsWith('--target=')) {
      addTargets(options.targets, arg.slice('--target='.length))
      continue
    }

    if (arg === '--config-dir') {
      const value = args[index + 1]
      if (!value) {
        throw new Error(`Missing value for ${arg}`)
      }

      options.configDir = value
      index += 1
      continue
    }

    if (arg.startsWith('--config-dir=')) {
      options.configDir = arg.slice('--config-dir='.length)
      continue
    }

    if (arg === '--skills-dir') {
      const value = args[index + 1]
      if (!value) {
        throw new Error(`Missing value for ${arg}`)
      }

      options.skillsDir = value
      index += 1
      continue
    }

    if (arg.startsWith('--skills-dir=')) {
      options.skillsDir = arg.slice('--skills-dir='.length)
      continue
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option '${arg}'`)
    }

    positionals.push(arg)
  }

  if (positionals.length > 0) {
    options.command = positionals[0]
  }

  return options
}

function addTargets(targets, rawValue) {
  for (const target of rawValue.split(',').map((value) => value.trim()).filter(Boolean)) {
    targets.push(target)
  }
}

async function resolveInstallPlans(cli) {
  if (cli.all && cli.targets.length > 0) {
    throw new Error(`Use either '--all' or '--target', not both.`)
  }

  if (cli.auto && (cli.all || cli.targets.length > 0)) {
    throw new Error(`Use either '--auto', '--all', or '--target', not a combination.`)
  }

  if (cli.skillsDir && (cli.auto || cli.all || cli.targets.length > 0)) {
    throw new Error(`'--skills-dir' cannot be combined with '--auto', '--all', or '--target'.`)
  }

  if (cli.skillsDir && cli.configDir) {
    throw new Error(`'--skills-dir' cannot be combined with '--config-dir'.`)
  }

  if (cli.auto && cli.configDir) {
    throw new Error(`'--auto' cannot be combined with '--config-dir'.`)
  }

  if (cli.auto && cli.command !== 'install') {
    throw new Error(`'--auto' is only supported with the 'install' command.`)
  }

  if (cli.skillsDir) {
    const skillsDir = path.resolve(expandHomePath(cli.skillsDir))

    return [
      {
        key: 'custom',
        label: 'Custom skills dir',
        configDir: null,
        skillsDir,
        targetDir: path.join(skillsDir, skillName),
        metadataFiles: [installMetadataFile],
      },
    ]
  }

  const requestedTargets = await resolveRequestedTargets(cli)

  const uniqueTargets = [...new Set(requestedTargets)]

  if (cli.configDir && uniqueTargets.length !== 1) {
    throw new Error(`'--config-dir' can only be used with exactly one target.`)
  }

  return uniqueTargets.map((targetId) => resolvePresetInstallPlan(targetId, cli.configDir))
}

async function resolveRequestedTargets(cli) {
  if (cli.all) {
    return targetDefinitions.map((target) => target.id)
  }

  if (cli.targets.length > 0) {
    return cli.targets
  }

  if (cli.auto || cli.command === 'install') {
    return resolveAutoDetectedTargets()
  }

  if (cli.command === 'status') {
    return targetDefinitions.map((target) => target.id)
  }

  throw new Error(
    `Choose an install destination with '--target <name>', '--all', or '--skills-dir <path>'. Run 'npx ${packageJson.name}@latest targets' to list preset targets.`,
  )
}

async function resolveAutoDetectedTargets() {
  const targetDetections = await collectTargetDetections()
  const detectedTargets = targetDetections.filter((entry) => entry.detection.detected).map((entry) => entry.target)

  if (detectedTargets.length === 1) {
    return [detectedTargets[0].id]
  }

  if (detectedTargets.length === 0) {
    throw new Error(
      `Could not auto-detect a standard OpenCode or Claude install. Run 'npx ${packageJson.name}@latest targets --detected' to inspect detection signals, or use '--target <name>' or '--skills-dir <path>' instead.`,
    )
  }

  throw new Error(
    `Auto-detect found multiple compatible tools (${detectedTargets.map((target) => target.id).join(', ')}). Run 'npx ${packageJson.name}@latest targets --detected' to inspect detection signals, then re-run with '--target <name>' to choose one explicitly.`,
  )
}

async function collectTargetDetections() {
  return Promise.all(
    targetDefinitions.map(async (target) => {
      const plan = resolvePresetInstallPlan(target.id)

      return {
        target,
        plan,
        detection: await detectTarget(target, plan),
      }
    }),
  )
}

async function detectTarget(target, plan) {
  const reasons = []
  let score = 0

  const detectedExecutable = await findAvailableExecutable(target.detectExecutables ?? [])
  if (detectedExecutable) {
    score = Math.max(score, 100)
    reasons.push(`CLI executable '${detectedExecutable}' found in PATH`)
  }

  const installSignal = await detectExistingInstallSignal(plan)
  if (installSignal.detected) {
    score = Math.max(score, installSignal.score)
    reasons.push(installSignal.reason)
  }

  return {
    detected: score > 0,
    score,
    reasons,
  }
}

async function detectExistingInstallSignal(plan) {
  const skillFilePath = path.join(plan.targetDir, 'SKILL.md')

  if (!(await pathExists(skillFilePath))) {
    return {
      detected: false,
      score: 0,
      reason: '',
    }
  }

  const metadata = await readInstallMetadata(plan.targetDir, plan.metadataFiles)
  const managed = Boolean(metadata?.skillName === skillName && managedPackageNames.has(metadata?.packageName ?? ''))

  return {
    detected: true,
    score: managed ? 90 : 80,
    reason: managed ? `managed skill install exists at ${plan.targetDir}` : `skill directory exists at ${plan.targetDir}`,
  }
}

async function findAvailableExecutable(executableNames) {
  for (const executableName of executableNames) {
    if (await isExecutableAvailable(executableName)) {
      return executableName
    }
  }

  return null
}

async function isExecutableAvailable(executableName) {
  const searchPath = process.env.PATH ?? ''

  if (!searchPath) {
    return false
  }

  const pathEntries = searchPath.split(path.delimiter).filter(Boolean)
  const pathExt = process.platform === 'win32' ? (process.env.PATHEXT ?? '.EXE;.CMD;.BAT;.COM').split(';') : ['']
  const candidateNames = process.platform === 'win32' ? pathExt.map((extension) => `${executableName}${extension}`) : [executableName]

  for (const directory of pathEntries) {
    for (const candidateName of candidateNames) {
      const candidatePath = path.join(directory, candidateName)

      try {
        await fs.access(candidatePath, fsConstants.X_OK)
        return true
      } catch {
        continue
      }
    }
  }

  return false
}

function resolvePresetInstallPlan(targetId, overrideConfigDir) {
  const target = targetDefinitions.find((candidate) => candidate.id === targetId)

  if (!target) {
    const knownTargets = targetDefinitions.map((candidate) => candidate.id).join(', ')
    throw new Error(`Unknown target '${targetId}'. Known targets: ${knownTargets}.`)
  }

  const configuredPath = overrideConfigDir || process.env[target.configDirEnv] || target.defaultConfigDir
  const configDir = path.resolve(expandHomePath(configuredPath))
  const skillsDir = path.join(configDir, target.skillsSubdir)

  return {
    key: target.id,
    label: target.label,
    configDir,
    skillsDir,
    targetDir: path.join(skillsDir, skillName),
    metadataFiles: [installMetadataFile, ...(target.legacyMetadataFiles ?? [])],
  }
}

function expandHomePath(value) {
  if (!value.startsWith('~/')) {
    return value
  }

  return path.join(os.homedir(), value.slice(2))
}

async function installSkill(plan) {
  await ensureBundledSkill()

  const state = await inspectInstall(plan.targetDir, plan.metadataFiles)

  await fs.mkdir(plan.skillsDir, { recursive: true })

  const stagingDir = path.join(plan.skillsDir, `${skillName}.staging-${Date.now()}-${process.pid}`)
  await fs.rm(stagingDir, { recursive: true, force: true })
  await fs.cp(bundledSkillDir, stagingDir, { recursive: true })
  await writeInstallMetadata(stagingDir, plan)

  const backupDir = path.join(plan.skillsDir, `${skillName}.backup-${Date.now()}-${process.pid}`)
  let movedExistingInstall = false

  try {
    if (state.exists) {
      await fs.rename(plan.targetDir, backupDir)
      movedExistingInstall = true
    }

    await fs.rename(stagingDir, plan.targetDir)

    if (movedExistingInstall) {
      await fs.rm(backupDir, { recursive: true, force: true })
    }
  } catch (error) {
    await fs.rm(stagingDir, { recursive: true, force: true })

    if (movedExistingInstall) {
      const targetExists = await pathExists(plan.targetDir)
      if (!targetExists) {
        await fs.rename(backupDir, plan.targetDir)
      }
    }

    throw error
  }

  const installMode = state.exists ? (state.managed ? 'Updated' : 'Replaced') : 'Installed'
  const installHint = state.exists && !state.managed ? ' (adopted existing unmanaged install)' : ''

  console.log(
    `${installMode} ${skillName}@${packageJson.version} for ${plan.label} at ${plan.targetDir}${installHint}`,
  )
}

async function uninstallSkill(plan, force) {
  const state = await inspectInstall(plan.targetDir, plan.metadataFiles)

  if (!state.exists) {
    console.log(`No installed skill found for ${plan.label} at ${plan.targetDir}`)
    return
  }

  if (!state.managed && !force) {
    throw new Error(
      `Refusing to remove unmanaged install for ${plan.label} at ${plan.targetDir}. Re-run with '--force' if you want to remove it anyway.`,
    )
  }

  await fs.rm(plan.targetDir, { recursive: true, force: true })
  console.log(`Removed ${skillName} for ${plan.label} from ${plan.targetDir}`)
}

async function printStatus(plans) {
  const bundledVersion = await readBundledSkillVersion()

  console.log(`Package: ${packageJson.name}@${packageJson.version}`)
  console.log(`Bundled skill: ${skillName}${bundledVersion ? `@${bundledVersion}` : ''}`)

  for (const [index, plan] of plans.entries()) {
    const state = await inspectInstall(plan.targetDir, plan.metadataFiles)

    if (index > 0) {
      console.log('')
    }

    console.log(`Target: ${plan.label}${plan.key !== 'custom' ? ` (${plan.key})` : ''}`)

    if (plan.configDir) {
      console.log(`Config dir: ${plan.configDir}`)
    }

    console.log(`Skills dir: ${plan.skillsDir}`)
    console.log(`Install path: ${plan.targetDir}`)
    console.log(`Installed: ${state.exists ? 'yes' : 'no'}`)

    if (!state.exists) {
      continue
    }

    console.log(`Managed: ${state.managed ? 'yes' : 'no'}`)

    if (state.skillVersion) {
      console.log(`Installed skill version: ${state.skillVersion}`)
    }

    if (state.metadata?.packageVersion) {
      console.log(`Installed by package: ${state.metadata.packageName}@${state.metadata.packageVersion}`)
    }
  }
}

async function inspectInstall(targetDir, metadataFiles) {
  try {
    const stat = await fs.lstat(targetDir)

    if (!stat.isDirectory() && !stat.isSymbolicLink()) {
      throw new Error(`Refusing to manage non-directory path: ${targetDir}`)
    }
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        exists: false,
        managed: false,
        metadata: null,
        skillVersion: null,
      }
    }

    throw error
  }

  const skillFilePath = path.join(targetDir, 'SKILL.md')
  if (!(await pathExists(skillFilePath))) {
    throw new Error(`Refusing to manage ${targetDir} because it does not contain SKILL.md`)
  }

  const metadata = await readInstallMetadata(targetDir, metadataFiles)
  const skillVersion = await readSkillVersion(skillFilePath)

  return {
    exists: true,
    managed: Boolean(metadata?.skillName === skillName && managedPackageNames.has(metadata?.packageName ?? '')),
    metadata,
    skillVersion,
  }
}

async function ensureBundledSkill() {
  const skillFilePath = path.join(bundledSkillDir, 'SKILL.md')

  if (!(await pathExists(skillFilePath))) {
    throw new Error(
      `Bundled skill artifact not found at ${bundledSkillDir}. Run 'npm run build:skill' before packaging or publishing.`,
    )
  }
}

async function writeInstallMetadata(targetDir, plan) {
  const metadata = {
    packageName: packageJson.name,
    packageVersion: packageJson.version,
    skillName,
    target: plan.key,
    installedAt: new Date().toISOString(),
  }

  await fs.writeFile(path.join(targetDir, installMetadataFile), `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')
}

async function readInstallMetadata(targetDir, metadataFiles) {
  for (const metadataFile of metadataFiles) {
    const metadataPath = path.join(targetDir, metadataFile)

    if (await pathExists(metadataPath)) {
      return readJson(metadataPath)
    }
  }

  return null
}

async function readBundledSkillVersion() {
  const skillFilePath = path.join(bundledSkillDir, 'SKILL.md')
  if (!(await pathExists(skillFilePath))) {
    return null
  }

  return readSkillVersion(skillFilePath)
}

async function readSkillVersion(skillFilePath) {
  const rawSkill = await fs.readFile(skillFilePath, 'utf8')
  const frontmatterMatch = rawSkill.match(/^---\n([\s\S]*?)\n---/)

  if (!frontmatterMatch?.[1]) {
    return null
  }

  const versionMatch = frontmatterMatch[1].match(/^\s*version:\s*(.+)\s*$/m)
  return versionMatch?.[1]?.replace(/^['"]|['"]$/g, '').trim() ?? null
}

async function readPackageJson() {
  const packageJsonPath = path.join(packageRoot, 'package.json')

  if (await pathExists(packageJsonPath)) {
    return readJson(packageJsonPath)
  }

  const bundledVersion = await readBundledSkillVersion()

  return {
    name: 'preact-best-practices',
    version: bundledVersion ?? '0.0.0',
  }
}

async function readInstallTargets() {
  const installTargetsPath = path.join(packageRoot, 'config', 'install-targets.json')
  const data = await readJson(installTargetsPath)

  if (!Array.isArray(data.targets) || data.targets.length === 0) {
    throw new Error(`Expected one or more install targets in ${installTargetsPath}`)
  }

  return data.targets
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function printTargets(showDetectedOnly) {
  const targetDetections = showDetectedOnly ? await collectTargetDetections() : []

  console.log('Supported install targets:')

  for (const target of targetDefinitions) {
    const baseLine = `- ${target.id}: ${target.label} (${target.defaultConfigDir}/${target.skillsSubdir})`

    if (!showDetectedOnly) {
      console.log(baseLine)
      continue
    }

    const detection = targetDetections.find((entry) => entry.target.id === target.id)?.detection
    const details = detection?.detected ? `detected via ${detection.reasons.join('; ')}` : 'not detected'

    console.log(`${baseLine} - ${details}`)
  }

  console.log('- custom: provide --skills-dir <path> for any other compatible tool')
}

function printHelp() {
  console.log(`preact-best-practices installer

Install or update the preact-best-practices skill for OpenCode, Claude, and other compatible tools.

Usage:
  npx preact-best-practices@latest install
  npx preact-best-practices@latest install --target opencode
  npx preact-best-practices@latest install --target claude
  npx preact-best-practices@latest install --all
  npx preact-best-practices@latest install --skills-dir ~/.my-tool/skills
  npx preact-best-practices@latest status
  npx preact-best-practices@latest status --target opencode
  npx preact-best-practices@latest uninstall --target claude
  npx preact-best-practices@latest targets
  npx preact-best-practices@latest targets --detected

Options:
  --auto                Alias for the default install auto-detect behavior
  --detected            Show why each preset target was or was not detected
  --target <name>      Install into a named target (repeat or pass comma-separated values)
  --all                Install into all known targets
  --config-dir <path>  Override the config directory for a single named target
  --skills-dir <path>  Install into an explicit skills directory for any compatible tool
  --force              Allow uninstalling an unmanaged existing install
  -h, --help           Show this help text

Notes:
  install defaults to safe auto-detect; uninstall still requires an explicit destination
  autodetect only trusts strong signals: a CLI on PATH or an existing skill install
  --auto fails if zero or multiple standard targets are detected
`)
}

await main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})
