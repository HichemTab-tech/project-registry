import {Args, Flags} from '@oclif/core'
import * as fs from 'node:fs'
import * as path from 'node:path'

import {BaseSyncCommand} from '../BaseSyncCommand.js'
import {getSyncRepoDir, loadSyncState, readRegistrySnapshot, saveSyncState} from '../utils/sync.js'

class SyncInit extends BaseSyncCommand {
    static args = {
        repoUrl: Args.string({description: 'Git repository URL used for sync', required: true}),
    }

    static description = 'Initialize sync using a private Git repository clone'

    static examples = [
        '<%= config.bin %> <%= command.id %> git@github.com:you/xcute-sync.git',
        '<%= config.bin %> <%= command.id %> https://github.com/you/xcute-sync.git --file data/xcute.json',
    ]

    static flags = {
        file: Flags.string({default: 'xcute.json', description: 'Registry file path inside the sync repo'}),
    }

    async run(): Promise<void> {
        const {args, flags} = await this.parse(SyncInit)
        const existing = loadSyncState()

        if (existing) {
            this.error(`Sync is already configured for ${existing.repoUrl}`)
        }

        const repoDir = getSyncRepoDir()
        if (fs.existsSync(repoDir)) {
            this.error(`Sync repo directory already exists at ${repoDir}. Remove it and retry.`)
        }

        try {
            this.git(['clone', args.repoUrl, repoDir])
        } catch (error) {
            if (error instanceof Error) {
                this.error(`Failed to clone sync repository: ${error.message}`)
            }

            this.error('Failed to clone sync repository.')
        }

        const registryPath = path.join(repoDir, flags.file)
        const remoteConfig = readRegistrySnapshot(registryPath) ?? {}

        saveSyncState({
            lastSyncedConfig: {},
            registryFile: flags.file,
            repoDir,
            repoUrl: args.repoUrl,
        })

        this.log(`Sync configured for ${args.repoUrl}`)

        const actionCount = Object.keys(remoteConfig).length
        if (actionCount > 0) {
            this.log(`Remote registry found at ${flags.file} with ${actionCount} actions. Run "xcute sync-pull" to merge it locally.`)
            return
        }

        this.log(`No remote registry file found at ${flags.file}. Run "xcute sync-push" to publish your local registry.`)
    }
}

// noinspection JSUnusedGlobalSymbols
export default SyncInit