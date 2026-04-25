import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const skillName = 'preact-best-practices'
const installMetadataFile = '.preact-best-practices-install.json'
const legacyMetadataFile = '.opencode-install.json'
const legacyPackageName = 'preact-best-practices-opencode'
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const cliPath = path.join(repoRoot, 'bin', 'preact-best-practices.mjs')
const distDir = path.join(repoRoot, 'dist', skillName)

type PackageJson = {
  name: string
  version: string
}

type CliResult = {
  code: number
  stdout: string
  stderr: string
}

async function main(): Promise<void> {
  await assertPathExists(path.join(distDir, 'SKILL.md'), `Built skill artifact not found at ${distDir}. Run 'npm run build:skill' first.`)

  const packageJson = await readPackageJson()
  const installTargets = await readInstallTargets()
  const targetIds = installTargets.map((target) => target.id)

  assert.deepEqual(targetIds, ['opencode', 'claude'], 'Expected public installer targets to stay limited to OpenCode and Claude.')

  await testDefaultInstall(packageJson, 'opencode')
  await testDefaultInstall(packageJson, 'claude')
  await testAutoInstall(packageJson, 'opencode')
  await testAutoInstall(packageJson, 'claude')
  await testTargetsDetectedOutput(packageJson)
  await testDefaultDetectAmbiguous()
  await testDefaultDetectMissing()
  await testAutoDetectAmbiguous()
  await testAutoDetectMissing()
  await testPresetTarget(packageJson, 'opencode')
  await testPresetTarget(packageJson, 'claude')
  await testCustomSkillsDir(packageJson)
  await testUnmanagedInstallProtection()
  await testLegacyOpenCodeMigration(packageJson)
  await testDetectedFlagRejectedForInstall()
  await testDetectedFlagRejectedForStatus()
  await testDetectedFlagRejectedForUninstall()

  console.log(`Installer smoke tests passed for ${packageJson.name}@${packageJson.version}`)
}

async function testDefaultInstall(packageJson: PackageJson, targetId: 'opencode' | 'claude'): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), `preact-best-practices-default-${targetId}-`))
  const homeDir = path.join(tempRoot, 'home')
  const configDir = targetId === 'opencode' ? path.join(homeDir, '.config', 'opencode') : path.join(homeDir, '.claude')
  const installDir = path.join(configDir, 'skills', skillName)

  try {
    const env = await buildDetectionEnv(homeDir, [targetId])

    const install = await runCli(['install'], true, env)
    assert.match(
      install.stdout,
      new RegExp(`Installed ${escapeRegExp(skillName)}@${escapeRegExp(packageJson.version)} for ${targetId === 'opencode' ? 'OpenCode' : 'Claude'}`),
      `bare install should default to ${targetId} when it is the only detected target`,
    )

    await assertPathExists(path.join(installDir, 'SKILL.md'), `bare install should create the ${targetId} skill directory`)
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

async function testDefaultDetectAmbiguous(): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'preact-best-practices-default-ambiguous-'))
  const homeDir = path.join(tempRoot, 'home')

  try {
    const env = await buildDetectionEnv(homeDir, ['opencode', 'claude'])

    const result = await runCli(['install'], false, env)
    assert.notEqual(result.code, 0, 'bare install should fail when multiple tools are detected')
    assert.match(result.stderr, /Auto-detect found multiple compatible tools/, 'bare install should explain ambiguous detection')
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

async function testDefaultDetectMissing(): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'preact-best-practices-default-missing-'))
  const homeDir = path.join(tempRoot, 'home')

  try {
    const env = await buildDetectionEnv(homeDir)

    const result = await runCli(['install'], false, env)
    assert.notEqual(result.code, 0, 'bare install should fail when no standard tool is detected')
    assert.match(result.stderr, /Could not auto-detect a standard OpenCode or Claude install/, 'bare install should explain missing detection')
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

async function testAutoInstall(packageJson: PackageJson, targetId: 'opencode' | 'claude'): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), `preact-best-practices-auto-${targetId}-`))
  const homeDir = path.join(tempRoot, 'home')
  const configDir = targetId === 'opencode' ? path.join(homeDir, '.config', 'opencode') : path.join(homeDir, '.claude')
  const installDir = path.join(configDir, 'skills', skillName)

  try {
    const env = await buildDetectionEnv(homeDir, [targetId])

    const install = await runCli(['install', '--auto'], true, env)
    assert.match(
      install.stdout,
      new RegExp(`Installed ${escapeRegExp(skillName)}@${escapeRegExp(packageJson.version)} for ${targetId === 'opencode' ? 'OpenCode' : 'Claude'}`),
      `auto install should choose ${targetId} when it is the only detected target`,
    )

    await assertPathExists(path.join(installDir, 'SKILL.md'), `auto install should create the ${targetId} skill directory`)
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

async function testTargetsDetectedOutput(packageJson: PackageJson): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'preact-best-practices-targets-detected-'))
  const homeDir = path.join(tempRoot, 'home')
  const configDir = path.join(homeDir, '.config', 'opencode')
  const installDir = path.join(configDir, 'skills', skillName)

  try {
    await fs.mkdir(path.dirname(installDir), { recursive: true })
    await fs.cp(distDir, installDir, { recursive: true })
    await fs.writeFile(
      path.join(installDir, installMetadataFile),
      `${JSON.stringify(
        {
          packageName: packageJson.name,
          packageVersion: packageJson.version,
          skillName,
          target: 'opencode',
          installedAt: new Date().toISOString(),
        },
        null,
        2,
      )}\n`,
      'utf8',
    )
    const env = await buildDetectionEnv(homeDir, ['opencode'])

    const result = await runCli(['targets', '--detected'], true, env)
    assert.match(result.stdout, /opencode: OpenCode .*detected via .*CLI executable 'opencode' found in PATH/, 'targets --detected should explain positive signals')
    assert.match(result.stdout, /managed skill install exists at/, 'targets --detected should mention existing managed installs')
    assert.match(result.stdout, /claude: Claude .*not detected/, 'targets --detected should mention missing targets')
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

async function testAutoDetectAmbiguous(): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'preact-best-practices-auto-ambiguous-'))
  const homeDir = path.join(tempRoot, 'home')

  try {
    const env = await buildDetectionEnv(homeDir, ['opencode', 'claude'])

    const result = await runCli(['install', '--auto'], false, env)
    assert.notEqual(result.code, 0, 'auto install should fail when multiple tools are detected')
    assert.match(result.stderr, /Auto-detect found multiple compatible tools/, 'auto install should explain ambiguous detection')
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

async function testAutoDetectMissing(): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'preact-best-practices-auto-missing-'))
  const homeDir = path.join(tempRoot, 'home')

  try {
    const env = await buildDetectionEnv(homeDir)

    const result = await runCli(['install', '--auto'], false, env)
    assert.notEqual(result.code, 0, 'auto install should fail when no standard tool is detected')
    assert.match(result.stderr, /Could not auto-detect a standard OpenCode or Claude install/, 'auto install should explain missing detection')
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

async function testPresetTarget(packageJson: PackageJson, targetId: 'opencode' | 'claude'): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), `preact-best-practices-${targetId}-`))
  const configDir = path.join(tempRoot, `${targetId}-config`)
  const installDir = path.join(configDir, 'skills', skillName)

  try {
    const statusBeforeInstall = await runCli(['status', '--target', targetId, '--config-dir', configDir])
    assert.match(statusBeforeInstall.stdout, /Installed: no/, `${targetId} status should start empty`)

    const firstInstall = await runCli(['install', '--target', targetId, '--config-dir', configDir])
    assert.match(
      firstInstall.stdout,
      new RegExp(`Installed ${escapeRegExp(skillName)}@${escapeRegExp(packageJson.version)}`),
      `${targetId} install should report a fresh install`,
    )

    await assertPathExists(path.join(installDir, 'SKILL.md'), `${targetId} install should create SKILL.md`)
    await assertPathExists(
      path.join(installDir, installMetadataFile),
      `${targetId} install should write managed install metadata`,
    )

    const statusAfterInstall = await runCli(['status', '--target', targetId, '--config-dir', configDir])
    assert.match(statusAfterInstall.stdout, /Installed: yes/, `${targetId} status should show the installed skill`)
    assert.match(statusAfterInstall.stdout, /Managed: yes/, `${targetId} status should show managed install metadata`)
    assert.match(
      statusAfterInstall.stdout,
      new RegExp(`Installed by package: ${escapeRegExp(packageJson.name)}@${escapeRegExp(packageJson.version)}`),
      `${targetId} status should reference the current package metadata`,
    )

    const secondInstall = await runCli(['install', '--target', targetId, '--config-dir', configDir])
    assert.match(
      secondInstall.stdout,
      new RegExp(`Updated ${escapeRegExp(skillName)}@${escapeRegExp(packageJson.version)}`),
      `${targetId} install should become an update on the second run`,
    )

    const uninstall = await runCli(['uninstall', '--target', targetId, '--config-dir', configDir])
    assert.match(
      uninstall.stdout,
      new RegExp(`Removed ${escapeRegExp(skillName)} for`),
      `${targetId} uninstall should remove the managed install`,
    )

    const statusAfterUninstall = await runCli(['status', '--target', targetId, '--config-dir', configDir])
    assert.match(statusAfterUninstall.stdout, /Installed: no/, `${targetId} status should be empty after uninstall`)
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

async function testCustomSkillsDir(packageJson: PackageJson): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'preact-best-practices-custom-'))
  const skillsDir = path.join(tempRoot, 'skills')
  const installDir = path.join(skillsDir, skillName)

  try {
    const statusBeforeInstall = await runCli(['status', '--skills-dir', skillsDir])
    assert.match(statusBeforeInstall.stdout, /Installed: no/, 'custom skills dir should start empty')

    const install = await runCli(['install', '--skills-dir', skillsDir])
    assert.match(
      install.stdout,
      new RegExp(`Installed ${escapeRegExp(skillName)}@${escapeRegExp(packageJson.version)} for Custom skills dir`),
      'custom install should succeed',
    )

    await assertPathExists(path.join(installDir, 'SKILL.md'), 'custom install should create SKILL.md')

    const statusAfterInstall = await runCli(['status', '--skills-dir', skillsDir])
    assert.match(statusAfterInstall.stdout, /Installed: yes/, 'custom status should show the installed skill')
    assert.match(statusAfterInstall.stdout, /Managed: yes/, 'custom status should show managed install metadata')

    const uninstall = await runCli(['uninstall', '--skills-dir', skillsDir])
    assert.match(uninstall.stdout, /Removed preact-best-practices for Custom skills dir/, 'custom uninstall should succeed')
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

async function testUnmanagedInstallProtection(): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'preact-best-practices-unmanaged-'))
  const skillsDir = path.join(tempRoot, 'skills')
  const installDir = path.join(skillsDir, skillName)

  try {
    await fs.mkdir(skillsDir, { recursive: true })
    await fs.cp(distDir, installDir, { recursive: true })

    const refusal = await runCli(['uninstall', '--skills-dir', skillsDir], false)
    assert.notEqual(refusal.code, 0, 'unmanaged installs should require --force for uninstall')
    assert.match(refusal.stderr, /Refusing to remove unmanaged install/, 'unmanaged uninstall should explain the failure')

    const forced = await runCli(['uninstall', '--skills-dir', skillsDir, '--force'])
    assert.match(forced.stdout, /Removed preact-best-practices for Custom skills dir/, 'forced uninstall should remove the unmanaged install')
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

async function testLegacyOpenCodeMigration(packageJson: PackageJson): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'preact-best-practices-legacy-opencode-'))
  const configDir = path.join(tempRoot, 'opencode-config')
  const skillsDir = path.join(configDir, 'skills')
  const installDir = path.join(skillsDir, skillName)

  try {
    await fs.mkdir(skillsDir, { recursive: true })
    await fs.cp(distDir, installDir, { recursive: true })
    await fs.writeFile(
      path.join(installDir, legacyMetadataFile),
      `${JSON.stringify(
        {
          packageName: legacyPackageName,
          packageVersion: packageJson.version,
          skillName,
          installedAt: new Date().toISOString(),
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    const status = await runCli(['status', '--target', 'opencode', '--config-dir', configDir])
    assert.match(status.stdout, /Managed: yes/, 'legacy OpenCode installs should still count as managed')
    assert.match(
      status.stdout,
      new RegExp(`Installed by package: ${escapeRegExp(legacyPackageName)}@${escapeRegExp(packageJson.version)}`),
      'status should surface the legacy package metadata before migration',
    )

    const install = await runCli(['install', '--target', 'opencode', '--config-dir', configDir])
    assert.match(
      install.stdout,
      new RegExp(`Updated ${escapeRegExp(skillName)}@${escapeRegExp(packageJson.version)}`),
      'legacy OpenCode installs should upgrade in place',
    )

    const nextMetadata = JSON.parse(await fs.readFile(path.join(installDir, installMetadataFile), 'utf8')) as {
      packageName?: string
    }
    assert.equal(nextMetadata.packageName, packageJson.name, 'migration should rewrite metadata to the current package name')
    await assertPathMissing(path.join(installDir, legacyMetadataFile), 'migration should drop the legacy metadata file')
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

async function testDetectedFlagRejectedForInstall(): Promise<void> {
  const result = await runCli(['install', '--detected'], false)
  assert.notEqual(result.code, 0, '--detected should be rejected for install')
  assert.match(result.stderr, /'--detected' is only supported with the 'targets' command/, 'install --detected should explain the restriction')
}

async function testDetectedFlagRejectedForStatus(): Promise<void> {
  const result = await runCli(['status', '--detected'], false)
  assert.notEqual(result.code, 0, '--detected should be rejected for status')
  assert.match(result.stderr, /'--detected' is only supported with the 'targets' command/, 'status --detected should explain the restriction')
}

async function testDetectedFlagRejectedForUninstall(): Promise<void> {
  const result = await runCli(['uninstall', '--detected'], false)
  assert.notEqual(result.code, 0, '--detected should be rejected for uninstall')
  assert.match(result.stderr, /'--detected' is only supported with the 'targets' command/, 'uninstall --detected should explain the restriction')
}

async function runCli(args: string[], expectSuccess = true, envOverrides: NodeJS.ProcessEnv = {}): Promise<CliResult> {
  const child = spawn(process.execPath, [cliPath, ...args], {
    cwd: repoRoot,
    env: { ...process.env, ...envOverrides },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const stdoutChunks: Buffer[] = []
  const stderrChunks: Buffer[] = []

  child.stdout.on('data', (chunk: Buffer) => {
    stdoutChunks.push(chunk)
  })

  child.stderr.on('data', (chunk: Buffer) => {
    stderrChunks.push(chunk)
  })

  const code = await new Promise<number>((resolve, reject) => {
    child.on('error', reject)
    child.on('close', (exitCode) => resolve(exitCode ?? 1))
  })

  const result = {
    code,
    stdout: Buffer.concat(stdoutChunks).toString('utf8'),
    stderr: Buffer.concat(stderrChunks).toString('utf8'),
  }

  if (expectSuccess && result.code !== 0) {
    throw new Error(
      [`Installer command failed: node ${path.relative(repoRoot, cliPath)} ${args.join(' ')}`, result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n'),
    )
  }

  return result
}

async function readPackageJson(): Promise<PackageJson> {
  const rawPackageJson = await fs.readFile(path.join(repoRoot, 'package.json'), 'utf8')
  return JSON.parse(rawPackageJson) as PackageJson
}

async function readInstallTargets(): Promise<Array<{ id: string }>> {
  const rawConfig = await fs.readFile(path.join(repoRoot, 'config', 'install-targets.json'), 'utf8')
  const parsed = JSON.parse(rawConfig) as { targets?: Array<{ id?: string }> }

  return (parsed.targets ?? []).map((target) => ({ id: target.id ?? '' }))
}

async function assertPathExists(filePath: string, message: string): Promise<void> {
  try {
    await fs.access(filePath)
  } catch {
    throw new Error(message)
  }
}

async function assertPathMissing(filePath: string, message: string): Promise<void> {
  try {
    await fs.access(filePath)
    throw new Error(message)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function buildDetectionEnv(homeDir: string, executableNames: string[] = []): Promise<NodeJS.ProcessEnv> {
  const binDir = path.join(homeDir, 'bin')

  await fs.mkdir(binDir, { recursive: true })
  await fs.mkdir(homeDir, { recursive: true })

  for (const executableName of executableNames) {
    const executablePath = path.join(binDir, executableName)
    await fs.writeFile(executablePath, '#!/bin/sh\nexit 0\n', 'utf8')
    await fs.chmod(executablePath, 0o755)
  }

  return {
    HOME: homeDir,
    USERPROFILE: homeDir,
    PATH: executableNames.length > 0 ? binDir : '',
  }
}

await main()
