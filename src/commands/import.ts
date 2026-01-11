import {Args, Flags} from '@oclif/core'
import * as fs from 'node:fs'
import * as path from 'node:path'

import {BaseCommand} from "../BaseCommand.js";
import {ConfigData, loadConfig, saveConfig} from '../utils/config.js'
import {prompts} from "../utils/prompts.js";

class Import extends BaseCommand {
    static args = {
        path: Args.string({description: 'Path to import file', required: true}),
    }

    static description = 'Import templates from a JSON file'

    static examples = [
        '<%= config.bin %> <%= command.id %> ./backup.json',
        '<%= config.bin %> <%= command.id %> ./backup.json --replace',
    ]

    static flags = {
        replace: Flags.boolean({default: false, description: 'Replace the entire registry'}),
    }

    // eslint-disable-next-line complexity
    async run(): Promise<void> {
        const {args, flags} = await this.parse(Import)
        let rawData: string

        // noinspection HttpUrlsUsage
        if (args.path.startsWith('http://') || args.path.startsWith('https://')) {
            try {
                const response = await fetch(args.path)
                if (!response.ok) {
                    this.error(`Failed to fetch URL: ${response.statusText} (${response.status})`)
                }

                rawData = await response.text()
            } catch (error: unknown) {
                if (error instanceof Error) {
                    this.error(`Failed to fetch URL: ${error.message}`)
                } else {
                    this.error('Failed to fetch URL due to an unknown error')
                }
            }
        } else {
            const sourcePath = path.resolve(args.path)
            if (!fs.existsSync(sourcePath)) {
                this.error(`File not found: ${sourcePath}`)
            }

            try {
                rawData = fs.readFileSync(sourcePath, 'utf8')
            } catch (error: unknown) {
                if (error && error instanceof Error) {
                    this.error(`Failed to read file: ${error.message}`)
                } else {
                    this.error('Failed to read file due to an unknown error')
                }
            }
        }

        let importData: unknown
        try {
            importData = JSON.parse(rawData)
        } catch (error: unknown) {
            if (error && error instanceof Error) {
                this.error(`Failed to parse JSON: ${error.message}`)
            } else {
                this.error('Invalid JSON file')
            }
        }

        // Validation
        if (typeof importData !== 'object' || importData === null || Array.isArray(importData)) {
            this.error('Invalid registry format: root must be an object')
        }

        for (const [key, value] of Object.entries(importData)) {
            if (!value || typeof value !== 'object') {
                this.error(`Invalid entry "${key}": must be an object`)
            }

            if (!Array.isArray(value.commands)) {
                this.error(`Invalid entry "${key}": must have "commands" array`)
            }

            if (!value.commands.every((c: unknown) => typeof c === 'string')) {
                this.error(`Invalid entry "${key}": commands must be strings`)
            }
        }

        const validImportData = importData as ConfigData

        if (flags.replace) {
            const confirm = await prompts.confirm({
                default: false,
                message: 'This will replace your ENTIRE current registry. Are you sure?',
            })
            if (!confirm) {
                this.log('Import cancelled.')
                return
            }

            saveConfig(validImportData)
            this.log('Registry replaced successfully.')
        } else {
            // Merge mode
            const currentConfig = loadConfig(true)
            let addedCount = 0
            let updatedCount = 0

            for (const [name, template] of Object.entries(validImportData)) {
                if (currentConfig[name]) {
                    const overwrite = await prompts.confirm({
                        default: false,
                        message: `Template "${name}" already exists. Overwrite?`,
                    })
                    if (overwrite) {
                        currentConfig[name] = template
                        updatedCount++
                    }
                } else {
                    currentConfig[name] = template
                    addedCount++
                }
            }

            if (addedCount > 0 || updatedCount > 0) {
                saveConfig(currentConfig)
                this.log(`Import completed. Added: ${addedCount}, Updated: ${updatedCount}`)
            } else {
                this.log('Import completed. No changes made.')
            }
        }
    }
}

// noinspection JSUnusedGlobalSymbols
export default Import