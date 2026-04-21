import {Flags} from '@oclif/core'

import {BaseSyncCommand} from '../BaseSyncCommand.js'
import {countConfigChanges, saveSyncState} from '../utils/sync.js'

class SyncPull extends BaseSyncCommand {
    static description = 'Pull the synced registry snapshot and merge it into the local registry'

    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> --strategy remote',
    ]

    static flags = {
        strategy: Flags.string({default: 'prompt', description: 'Conflict strategy: local, remote, or prompt'}),
    }

    async run(): Promise<void> {
        const {flags} = await this.parse(SyncPull)
        const {conflicts, localConfig, merged, remoteConfig, state} = await this.pullState(flags.strategy)
        saveSyncState({...state, lastSyncedConfig: remoteConfig})

        const changes = countConfigChanges(localConfig, merged)
        this.log(`Sync pull complete. Added: ${changes.added}, Updated: ${changes.updated}, Removed: ${changes.removed}, Conflicts: ${conflicts.length}`)
    }
}

// noinspection JSUnusedGlobalSymbols
export default SyncPull