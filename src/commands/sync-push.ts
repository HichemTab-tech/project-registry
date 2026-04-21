import {Flags} from '@oclif/core'

import {BaseSyncCommand} from '../BaseSyncCommand.js'
import {countConfigChanges, saveSyncState, writeRegistrySnapshot} from '../utils/sync.js'

class SyncPush extends BaseSyncCommand {
    static description = 'Merge local registry changes into the sync repo and push them upstream'

    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> --strategy local',
    ]

    static flags = {
        strategy: Flags.string({default: 'prompt', description: 'Conflict strategy: local, remote, or prompt'}),
    }

    async run(): Promise<void> {
        const {flags} = await this.parse(SyncPush)
        const {conflicts, merged, remoteConfig, state} = await this.pullState(flags.strategy)
        writeRegistrySnapshot(this.getRegistryFilePath(state), merged)

        const changes = countConfigChanges(remoteConfig, merged)
        if (changes.added === 0 && changes.updated === 0 && changes.removed === 0) {
            saveSyncState({...state, lastSyncedConfig: merged})
            this.log(`Sync push complete. No remote changes needed. Conflicts: ${conflicts.length}`)
            return
        }

        try {
            this.git(['add', state.registryFile], state.repoDir)
            this.git(['commit', '-m', 'sync xcute registry'], state.repoDir)
            this.git(['push', '--set-upstream', 'origin', 'HEAD'], state.repoDir)
        } catch (error) {
            if (error instanceof Error) {
                this.error(`Failed to push sync changes: ${error.message}`)
            }

            this.error('Failed to push sync changes.')
        }

        saveSyncState({...state, lastSyncedConfig: merged})
        this.log(`Sync push complete. Added: ${changes.added}, Updated: ${changes.updated}, Removed: ${changes.removed}, Conflicts: ${conflicts.length}`)
    }
}

// noinspection JSUnusedGlobalSymbols
export default SyncPush