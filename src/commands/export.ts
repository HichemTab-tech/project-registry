import {Args} from '@oclif/core'
import * as fs from 'node:fs'
import * as path from 'node:path'

import {BaseCommand} from "../BaseCommand.js";
import {loadConfig} from '../utils/config.js'
import {prompts} from "../utils/prompts.js";

class Export extends BaseCommand {
    static args = {
        path: Args.string({description: 'Path to export file', required: true}),
    }

    static description = 'Export the template registry to a JSON file'

    static examples = [
        '<%= config.bin %> <%= command.id %> ./backup.json',
    ]

    async run(): Promise<void> {
        const {args} = await this.parse(Export)
        const config = loadConfig()

        let targetPath = path.resolve(args.path)

        // Check if targetPath is a directory
        try {
            const stats = fs.statSync(targetPath)
            if (stats.isDirectory()) {
                targetPath = path.join(targetPath, 'project-registry.json')
            }
        } catch (error: unknown) {
            // If file/dir doesn't exist, we treat it as the target file path
            if (!error || typeof error !== "object" || !("code" in error) || error.code !== 'ENOENT') {
                if (error && error instanceof Error) {
                    this.error(`Failed to access path: ${error.message}`)
                } else {
                    this.error('Failed to access path due to an unknown error')
                }
            }
        }

        if (fs.existsSync(targetPath)) {
            const confirm = await prompts.confirm({
                default: false,
                message: `File ${targetPath} already exists. Overwrite?`,
            })
            if (!confirm) {
                this.log('Export cancelled.')
                return
            }
        }

        const json = JSON.stringify(config, null, 2)
        fs.writeFileSync(targetPath, json, 'utf8')
        this.log(`Registry exported to ${targetPath}`)
    }
}

// noinspection JSUnusedGlobalSymbols
export default Export