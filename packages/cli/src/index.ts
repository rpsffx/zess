#!/usr/bin/env node

import child_process from 'node:child_process'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import {
  cancel,
  intro,
  isCancel,
  log,
  note,
  outro,
  select,
  spinner,
  text,
} from '@clack/prompts'
import { program } from 'commander'
import gradient from 'gradient-string'
import pc from 'picocolors'
import { description, version } from '../package.json'
import { name } from '../template/common/package.json'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const exec = promisify(child_process.exec)

function showWelcomeMessage(): void {
  process.stdout.write('\n')
  intro(
    gradient(['skyblue', 'khaki'])(
      'Welcome to Zess - A compiler-driven framework for high-performance web apps',
    ),
  )
}

async function promptUser(): Promise<{
  projectName: string
  useTypeScript: boolean
}> {
  const projectName = await text({
    message: 'Project name:',
    placeholder: name,
    defaultValue: name,
    validate(value) {
      if (value && !value.trim()) {
        return 'Project name cannot be empty'
      }
    },
  })
  if (isCancel(projectName)) {
    cancel('Operation cancelled')
    return process.exit(0)
  }
  const useTypeScript = await select({
    message: 'Project language:',
    options: [
      { value: true, label: 'TypeScript' },
      { value: false, label: 'JavaScript' },
    ],
  })
  if (isCancel(useTypeScript)) {
    cancel('Operation cancelled')
    return process.exit(0)
  }
  return { projectName, useTypeScript }
}

async function createProject(
  directoryName: string,
  projectName: string,
  useTypeScript: boolean,
): Promise<void> {
  const directoryPath = path.join(process.cwd(), directoryName)
  if (existsSync(directoryPath)) {
    log.step(`Using existing directory: ${pc.cyan(directoryName)}`)
  } else {
    log.step(`Creating project directory: ${pc.cyan(directoryName)}`)
    await mkdir(directoryPath, { recursive: true })
  }
  await copyTemplateFiles(directoryPath, projectName, useTypeScript)
  await installDependencies(directoryPath)
}

async function copyTemplateFiles(
  projectPath: string,
  projectName: string,
  useTypeScript: boolean,
): Promise<void> {
  const setupSpinner = spinner()
  setupSpinner.start('Setting up project files...')
  const templatePath = path.join(__dirname, '..', 'template')
  await copyDirectory(path.join(templatePath, 'common'), projectPath, {
    '.gitignore': async (srcPath, destPath) => {
      if (!existsSync(destPath)) return true
      const srcGitignore = await readFile(srcPath, 'utf-8')
      const destGitignore = await readFile(destPath, 'utf-8')
      await writeFile(destPath, `${destGitignore}\n${srcGitignore}`)
    },
    'package.json': async (srcPath, destPath) => {
      await mergePackageJson(srcPath, destPath, projectName, useTypeScript)
    },
    'README.md': async (srcPath, destPath) => {
      if (projectName === name) return true
      const srcReadme = await readFile(srcPath, 'utf-8')
      await writeFile(destPath, srcReadme.replace(name, projectName))
    },
  })
  await copyDirectory(
    path.join(templatePath, useTypeScript ? 'typescript' : 'javascript'),
    projectPath,
  )
  setupSpinner.stop('Project files set up')
}

async function installDependencies(projectPath: string): Promise<void> {
  const installSpinner = spinner()
  installSpinner.start('Installing dependencies...')
  await exec('npm install', { cwd: projectPath })
  installSpinner.stop('Dependencies installed successfully!')
}

async function copyDirectory(
  srcDir: string,
  destDir: string,
  handlers?: Record<
    string,
    (src: string, dest: string) => Promise<boolean | void>
  >,
): Promise<void> {
  const files = await readdir(srcDir, { withFileTypes: true })
  if (!existsSync(destDir)) await mkdir(destDir, { recursive: true })
  for (const file of files) {
    const srcPath = path.join(srcDir, file.name)
    const destPath = path.join(destDir, file.name)
    if (
      handlers?.[file.name] &&
      !(await handlers[file.name](srcPath, destPath))
    ) {
      continue
    }
    if (file.isDirectory()) {
      await copyDirectory(srcPath, destPath, handlers)
    } else {
      await copyFile(srcPath, destPath)
    }
  }
}

async function mergePackageJson(
  srcPath: string,
  destPath: string,
  projectName: string,
  useTypeScript: boolean,
): Promise<void> {
  let srcPackageJson = JSON.parse(await readFile(srcPath, 'utf-8'))
  if (existsSync(destPath)) {
    const destPackageJson = JSON.parse(await readFile(destPath, 'utf-8'))
    Object.assign(destPackageJson.dependencies, srcPackageJson.dependencies)
    Object.assign(
      destPackageJson.devDependencies,
      srcPackageJson.devDependencies,
    )
    Object.assign(destPackageJson.scripts, srcPackageJson.scripts)
    destPackageJson.prettier = srcPackageJson.prettier
    srcPackageJson = destPackageJson
  }
  srcPackageJson.version = '0.0.0'
  srcPackageJson.name = projectName
  delete srcPackageJson.devDependencies[
    useTypeScript ? 'eslint-plugin-react' : 'typescript'
  ]
  await writeFile(destPath, JSON.stringify(srcPackageJson, null, 2))
}

function showInstructions(title: string, ...instructions: string[]): void {
  note(instructions.map(pc.cyan).join('\n'), title)
}

function init(): void {
  program
    .version(version)
    .description(description)
    .argument('<directory>', 'directory to create the project in')
    .action(async (directory: string) => {
      showWelcomeMessage()
      const { projectName, useTypeScript } = await promptUser()
      try {
        await createProject(directory, projectName, useTypeScript)
        showInstructions(
          'Done! We suggest you start by typing:',
          `cd ${directory}`,
          'npm run dev',
        )
        showInstructions(
          'Then open your browser and visit:',
          'Local:   http://localhost:5173/',
          'Network: use --host to expose',
        )
        outro('Happy coding with your Zess project!')
      } catch (error: any) {
        process.stderr.write(error?.message ?? error)
        process.exit(1)
      }
    })
    .parse()
}

init()
