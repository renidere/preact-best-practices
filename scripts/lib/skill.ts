import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import fg from 'fast-glob'
import matter from 'gray-matter'
import YAML from 'yaml'

export type Manifest = {
  name: string
  version: string
  description: string
  license: string
  compatibility: string
  organization: string
  date: string
  abstract: string
  metadata?: Record<string, string>
  optimizationOrder?: string[]
  references?: string[]
}

export type Section = {
  id: string
  title: string
  impact: string
  order: number
  prefix: string
  description: string
}

export type Rule = {
  id: string
  fileName: string
  title: string
  impact: string
  impactDescription?: string
  tags: string[]
  category: string
  summary: string
  body: string
  sourcePath: string
}

export type SourceSkill = {
  repoRoot: string
  sourceDir: string
  manifest: Manifest
  sections: Section[]
  entrypoint: string
  rules: Rule[]
  referencesDir: string
  licensePath: string
  vendorFiles: string[]
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(scriptDir, '..', '..')
export const sourceDir = path.join(repoRoot, 'src', 'preact-best-practices')
export const distDir = path.join(repoRoot, 'dist', 'preact-best-practices')

export async function loadSourceSkill(): Promise<SourceSkill> {
  const manifestPath = path.join(sourceDir, 'manifest.yaml')
  const sectionsPath = path.join(sourceDir, 'sections.yaml')
  const entrypointPath = path.join(sourceDir, 'entrypoint.md')
  const rulesDir = path.join(sourceDir, 'rules')
  const referencesDir = path.join(sourceDir, 'references')
  const vendorsDir = path.join(sourceDir, 'vendors')
  const licensePath = path.join(sourceDir, 'LICENSE.txt')

  const manifest = YAML.parse(await fs.readFile(manifestPath, 'utf8')) as Manifest
  const sectionFile = YAML.parse(await fs.readFile(sectionsPath, 'utf8')) as { sections: Section[] }
  const entrypoint = (await fs.readFile(entrypointPath, 'utf8')).trim()

  const ruleFiles = (await fg('*.md', { cwd: rulesDir, absolute: true })).sort()
  const rules = await Promise.all(ruleFiles.map(loadRule))
  const vendorFiles = (await fg('*.yaml', { cwd: vendorsDir, absolute: true })).sort()

  return {
    repoRoot,
    sourceDir,
    manifest,
    sections: [...sectionFile.sections].sort((left, right) => left.order - right.order),
    entrypoint,
    rules: rules.sort((left, right) => left.id.localeCompare(right.id)),
    referencesDir,
    licensePath,
    vendorFiles,
  }
}

async function loadRule(rulePath: string): Promise<Rule> {
  const fileName = path.basename(rulePath)
  const id = fileName.replace(/\.md$/, '')
  const raw = await fs.readFile(rulePath, 'utf8')
  const parsed = matter(raw)
  const data = parsed.data as {
    title?: string
    impact?: string
    impactDescription?: string
    tags?: string[] | string
    summary?: string
  }
  const title = data.title?.trim() ?? id
  const impact = data.impact?.trim() ?? 'UNKNOWN'
  const category = id.split('-')[0] ?? id

  return {
    id,
    fileName,
    title,
    impact,
    impactDescription: data.impactDescription?.trim(),
    tags: normalizeTags(data.tags),
    category,
    summary: data.summary?.trim() ?? extractSummary(parsed.content),
    body: parsed.content.trim(),
    sourcePath: rulePath,
  }
}

function normalizeTags(tags: string[] | string | undefined): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean)
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  return []
}

function extractSummary(content: string): string {
  const paragraphs = content
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  for (const paragraph of paragraphs) {
    if (paragraph.startsWith('## ')) {
      continue
    }

    if (paragraph.startsWith('**Impact:')) {
      continue
    }

    if (paragraph.startsWith('**Incorrect')) {
      break
    }

    if (paragraph.startsWith('**Correct')) {
      break
    }

    if (paragraph.startsWith('Reference:')) {
      continue
    }

    return paragraph
  }

  return 'No summary available.'
}

export function validateSourceSkill(skill: SourceSkill): string[] {
  return [
    ...validateManifest(skill),
    ...validateEntrypoint(skill),
    ...validateSections(skill.sections),
    ...validateRules(skill.rules, skill.sections),
    ...validateSectionCoverage(skill.rules, skill.sections),
  ]
}

function validateManifest(skill: SourceSkill): string[] {
  return [
    ...(!skill.manifest.name?.trim() ? ['manifest.yaml: name is required'] : []),
    ...(!skill.manifest.description?.trim() ? ['manifest.yaml: description is required'] : []),
    ...((skill.manifest.description ?? '').length > 1024
      ? ['manifest.yaml: description must stay under 1024 characters']
      : []),
  ]
}

function validateEntrypoint(skill: SourceSkill): string[] {
  return !skill.entrypoint.startsWith('# ')
    ? ['entrypoint.md: expected a top-level heading at the start of the file']
    : []
}

function validateSections(sections: Section[]): string[] {
  const { errors } = sections.reduce(
    (acc, section) => {
      const duplicateId = acc.seenIds.has(section.id)
        ? [`sections.yaml: duplicate section id '${section.id}'`]
        : []
      const duplicatePrefix = acc.seenPrefixes.has(section.prefix)
        ? [`sections.yaml: duplicate section prefix '${section.prefix}'`]
        : []
      const missingFields =
        !section.id || !section.title || section.order === undefined || !section.prefix
          ? [`sections.yaml: section '${section.id || '<unknown>'}' is missing required fields`]
          : []

      return {
        seenIds: new Set([...acc.seenIds, section.id]),
        seenPrefixes: new Set([...acc.seenPrefixes, section.prefix]),
        errors: [...acc.errors, ...duplicateId, ...duplicatePrefix, ...missingFields],
      }
    },
    { seenIds: new Set<string>(), seenPrefixes: new Set<string>(), errors: [] as string[] },
  )

  return errors
}

function validateRules(rules: Rule[], sections: Section[]): string[] {
  const { errors } = rules.reduce(
    (acc, rule) => {
      const duplicate = acc.seenIds.has(rule.id)
        ? [`rules: duplicate rule id '${rule.id}'`]
        : []

      const matchingSection = sections.find((section) => section.id === rule.category)
      const categoryErrors = !matchingSection
        ? [`rules/${rule.fileName}: no section found for category '${rule.category}'`]
        : !rule.id.startsWith(matchingSection.prefix)
          ? [`rules/${rule.fileName}: expected prefix '${matchingSection.prefix}' for category '${matchingSection.id}'`]
          : []

      const fieldErrors = [
        ...(!rule.title.trim() ? [`rules/${rule.fileName}: title is required in frontmatter`] : []),
        ...(!rule.impact.trim() ? [`rules/${rule.fileName}: impact is required in frontmatter`] : []),
        ...(!rule.summary.trim() ? [`rules/${rule.fileName}: summary could not be derived from the body`] : []),
      ]

      return {
        seenIds: new Set([...acc.seenIds, rule.id]),
        errors: [...acc.errors, ...duplicate, ...categoryErrors, ...fieldErrors],
      }
    },
    { seenIds: new Set<string>(), errors: [] as string[] },
  )

  return errors
}

function validateSectionCoverage(rules: Rule[], sections: Section[]): string[] {
  return sections
    .filter((section) => !rules.some((rule) => rule.category === section.id))
    .map((section) => `sections.yaml: section '${section.id}' has no matching rule files`)
}

export function renderSkill(skill: SourceSkill): string {
  const frontmatter = YAML.stringify({
    name: skill.manifest.name,
    description: skill.manifest.description,
    license: skill.manifest.license,
    compatibility: skill.manifest.compatibility,
    metadata: {
      ...skill.manifest.metadata,
      version: skill.manifest.version,
      organization: skill.manifest.organization,
    },
  }).trim()

  const sectionRows = skill.sections
    .map((section) => {
      return `| ${section.order} | ${section.title} | ${section.impact} | \`${section.prefix}\` |`
    })
    .join('\n')

  const quickReference = skill.sections
    .map((section) => {
      const rules = skill.rules.filter((rule) => rule.category === section.id)
      const bullets = rules.map((rule) => `- \`${rule.id}\` - ${rule.summary}`).join('\n')

      return [`### ${section.order}. ${section.title} (${section.impact})`, bullets].join('\n\n')
    })
    .join('\n\n')

  return [
    '---',
    frontmatter,
    '---',
    '',
    skill.entrypoint,
    '',
    '## Rule Categories by Priority',
    '',
    '| Priority | Category | Impact | Prefix |',
    '| -------- | -------- | ------ | ------ |',
    sectionRows,
    '',
    '## Quick Reference',
    '',
    quickReference,
    '',
    '## Deep References',
    '',
    '- Read `references/review-order.md` for the default review order and response expectations.',
    '- Read `references/gotchas.md` before suggesting stack changes, new state models, or broad performance advice.',
    '- Read `references/full-guide.md` for the compiled full guide grouped by priority and impact.',
    '- Read `references/rule-index.md` for the compact rule index.',
    '- Read individual files in `rules/` for atomic explanations and examples.',
  ].join('\n')
}

export function renderFullGuide(skill: SourceSkill): string {
  const toc = skill.sections
    .map((section) => {
      const index = section.order + 1
      return `${index}. [${section.title}](#${slugify(`${index}-${section.title}`)}) - **${section.impact}**`
    })
    .join('\n')

  const sectionContent = skill.sections
    .map((section) => {
      const sectionRules = skill.rules.filter((rule) => rule.category === section.id)
      const index = section.order + 1
      const rulesText = sectionRules
        .map((rule, ruleIndex) => {
          return [
            `### ${index}.${ruleIndex + 1} ${rule.title}`,
            '',
            rule.summary,
            '',
            `Rule file: [\`../rules/${rule.fileName}\`](../rules/${rule.fileName})`,
          ].join('\n')
        })
        .join('\n\n')

      return [
        `## ${index}. ${section.title}`,
        '',
        `**Impact: ${section.impact}**`,
        '',
        section.description,
        '',
        rulesText,
      ].join('\n')
    })
    .join('\n\n---\n\n')

  const optimizationOrder = (skill.manifest.optimizationOrder ?? [])
    .map((step, index) => `${index + 1}. ${step}`)
    .join('\n')

  const sourceReferences = (skill.manifest.references ?? [])
    .map((reference) => `- ${reference}`)
    .join('\n')

  return [
    `# ${titleCaseFromSlug(skill.manifest.name)}`,
    '',
    `**Version ${skill.manifest.version}**`,
    `${skill.manifest.organization}`,
    `${skill.manifest.date}`,
    '',
    '> Generated compiled guide for deeper reviews and refactors.',
    '',
    '## Abstract',
    '',
    skill.manifest.abstract,
    '',
    '## Default Optimization Order',
    '',
    optimizationOrder,
    '',
    '## Table of Contents',
    '',
    toc,
    '',
    '---',
    '',
    sectionContent,
    '',
    '---',
    '',
    '## Deep References',
    '',
    '- `review-order.md` - the default review order and response expectations.',
    '- `gotchas.md` - recurring corrections and stack-specific pitfalls.',
    '- `rationale.md` - why the skill is scoped the way it is.',
    '',
    '## Source References',
    '',
    sourceReferences,
  ].join('\n')
}

export function renderRuleIndex(skill: SourceSkill): string {
  const rows = skill.rules
    .map((rule) => {
      const section = skill.sections.find((candidate) => candidate.id === rule.category)
      return `| \`${rule.id}\` | ${section?.title ?? rule.category} | ${rule.impact} | ${rule.summary} |`
    })
    .join('\n')

  return [
    '# Rule Index',
    '',
    '| Rule | Category | Impact | Summary |',
    '| ---- | -------- | ------ | ------- |',
    rows,
  ].join('\n')
}

export async function ensureEmptyDir(targetDir: string): Promise<void> {
  await fs.rm(targetDir, { recursive: true, force: true })
  await fs.mkdir(targetDir, { recursive: true })
}

export async function copyRuntimeFiles(skill: SourceSkill, targetDir: string): Promise<void> {
  await copyMarkdownFiles(path.join(skill.sourceDir, 'rules'), path.join(targetDir, 'rules'))
  await copyMarkdownFiles(skill.referencesDir, path.join(targetDir, 'references'))
  await fs.copyFile(skill.licensePath, path.join(targetDir, 'LICENSE.txt'))

  if (skill.vendorFiles.length > 0) {
    const agentsDir = path.join(targetDir, 'agents')
    await fs.mkdir(agentsDir, { recursive: true })

    for (const vendorFile of skill.vendorFiles) {
      const vendorName = path.basename(vendorFile)
      await fs.copyFile(vendorFile, path.join(agentsDir, vendorName))
    }
  }
}

async function copyMarkdownFiles(fromDir: string, toDir: string): Promise<void> {
  await fs.mkdir(toDir, { recursive: true })
  const files = (await fg('*.md', { cwd: fromDir, absolute: true })).sort()

  for (const file of files) {
    await fs.copyFile(file, path.join(toDir, path.basename(file)))
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function titleCaseFromSlug(value: string): string {
  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}
