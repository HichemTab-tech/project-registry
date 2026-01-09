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

const CONFIG_DIR = path.join(os.homedir(), '.project-registry')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

function ensureConfigDir(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, {recursive: true})
    }
}

function ensureConfigFile(): void {
    ensureConfigDir()
    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify({}, null, 2), 'utf8')
    }
}

export function loadConfig(): ConfigData {
    ensureConfigFile()
    const content = fs.readFileSync(CONFIG_FILE, 'utf8')
    try {
        return JSON.parse(content) as ConfigData
    } catch {
        return {}
    }
}

export function saveConfig(config: ConfigData): void {
    ensureConfigFile()
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8')
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

export function getAllTemplates(): ConfigData {
    return loadConfig()
}
