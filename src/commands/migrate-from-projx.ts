import {execSync} from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {BaseCommand} from '../BaseCommand.js'
import {ConfigData, getConfigFile} from '../utils/config.js'
import {prompts} from '../utils/prompts.js'

const standaloneProjxPattern = /(?<![a-z0-9_-])projx(?![a-z0-9_-])/g

class MigrateFromProjx extends BaseCommand {
    static description = 'Migrate legacy projx/project-registry config into xcute'

    static examples = ['<%= config.bin %> <%= command.id %>']

    exec(command: string): Buffer {
        return execSync(command)
    }

    getLegacyConfigDir(): string {
        return path.join(os.homedir(), '.project-registry')
    }

    hasLegacyGlobalInstall(): boolean {
        try {
            const globalNodeModulesPath = this.exec('npm root -g').toString().trim()
            return fs.existsSync(path.join(globalNodeModulesPath, 'project-registry'))
        } catch {
            return false
        }
    }

    async run(): Promise<void> {
        await this.parse(MigrateFromProjx)

        const legacyConfigDir = this.getLegacyConfigDir()
        const legacyConfigFile = path.join(legacyConfigDir, 'config.json')
        const currentConfigFile = getConfigFile()

        if (fs.existsSync(legacyConfigFile)) {
            this.migrateConfig(legacyConfigFile, currentConfigFile)
        } else {
            this.log(`No legacy project-registry config found at ${legacyConfigFile}`)
        }

        if (!this.hasLegacyGlobalInstall()) {
            return
        }

        const shouldUninstall = await prompts.confirm({
            default: false,
            message: 'Legacy global package "project-registry" is installed. Run "npm uninstall project-registry -g" now?',
        })

        if (!shouldUninstall) {
            this.log('Skipped uninstalling project-registry.')
            return
        }

        const stdout = this.exec('npm uninstall project-registry -g').toString().trim()
        if (stdout) {
            this.log(stdout)
        }

        this.log('Global package "project-registry" removed.')
    }

    private migrateConfig(legacyConfigFile: string, currentConfigFile: string): void {
        const migratedRaw = fs.readFileSync(legacyConfigFile, 'utf8').replaceAll(standaloneProjxPattern, 'xcute')

        fs.mkdirSync(path.dirname(currentConfigFile), {recursive: true})

        if (fs.existsSync(currentConfigFile)) {
            const legacyConfig = this.parseConfig(migratedRaw, legacyConfigFile)
            const currentConfig = this.parseConfig(fs.readFileSync(currentConfigFile, 'utf8'), currentConfigFile)
            const mergedConfig: ConfigData = {...legacyConfig, ...currentConfig}
            const preservedCount = Object.keys(legacyConfig).filter((key) => key in currentConfig).length
            const addedCount = Object.keys(legacyConfig).length - preservedCount

            fs.writeFileSync(currentConfigFile, JSON.stringify(mergedConfig, null, 2), 'utf8')
            this.log(`Migrated legacy config into ${currentConfigFile}. Added: ${addedCount}, Kept existing: ${preservedCount}`)
        } else {
            fs.writeFileSync(currentConfigFile, migratedRaw, 'utf8')
            this.log(`Migrated legacy config to ${currentConfigFile}`)
        }

        fs.rmSync(legacyConfigFile)
        if (fs.existsSync(path.dirname(legacyConfigFile)) && fs.readdirSync(path.dirname(legacyConfigFile)).length === 0) {
            fs.rmdirSync(path.dirname(legacyConfigFile))
        }
    }

    private parseConfig(content: string, filePath: string): ConfigData {
        try {
            const parsed = JSON.parse(content) as unknown
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                this.error(`Invalid config format in ${filePath}`)
            }

            return parsed as ConfigData
        } catch (error) {
            if (error instanceof Error) {
                this.error(`Failed to parse config ${filePath}: ${error.message}`)
            }

            this.error(`Failed to parse config ${filePath}`)
        }
    }
}

// noinspection JSUnusedGlobalSymbols
export default MigrateFromProjx