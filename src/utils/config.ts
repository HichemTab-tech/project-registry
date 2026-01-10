import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

export interface Template {
    commands: string[]
    description?: string
}

export interface ConfigData {
    [key: string]: Template
}

let customConfigDir: string | undefined

export function setConfigDir(dir: string): void {
  customConfigDir = dir
}

const getConfigDir = () => customConfigDir || path.join(os.homedir(), '.project-registry')
const getConfigFile = () => path.join(getConfigDir(), 'config.json')

function ensureConfigDir(): void {
    const dir = getConfigDir()
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true})
    }
}

function ensureConfigFile(): void {
    ensureConfigDir()
    const file = getConfigFile()
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify({}, null, 2), 'utf8')
        writePresetConfig()
    }
}

function writePresetConfig(): void {
    const content = fs.readFileSync("./presets/default.json", 'utf8');
    const preset = JSON.parse(content) as ConfigData
    saveConfig(preset);
}

export function loadConfig(): ConfigData {
    ensureConfigFile()
    const content = fs.readFileSync(getConfigFile(), 'utf8')
    try {
        return JSON.parse(content) as ConfigData
    } catch {
        return {}
    }
}

export function saveConfig(config: ConfigData): void {
    ensureConfigFile()
    fs.writeFileSync(getConfigFile(), JSON.stringify(config, null, 2), 'utf8')
}

export function getTemplate(name: string): Template | undefined {
    const config = loadConfig()
    return config[name]
}

export function setTemplate(name: string, template: Template): void {
    const config = loadConfig()
    config[name] = template
    saveConfig(config)
}

export function deleteTemplate(name: string): boolean {
    const config = loadConfig()
    if (config[name]) {
        delete config[name]
        saveConfig(config)
        return true
    }

    return false
}

export function templateExists(name: string): boolean {
    const config = loadConfig()
    return name in config
}

export function getAllTemplates(filter?: string): ConfigData {
    const config = loadConfig()
    if (!filter) return config
    return Object.fromEntries(Object.entries(config).filter(([name]) => name.toLowerCase().includes(filter.toLowerCase())))
}
