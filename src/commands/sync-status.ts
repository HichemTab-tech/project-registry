import {BaseSyncCommand} from '../BaseSyncCommand.js'
import {loadConfig} from '../utils/config.js'
import {countConfigChanges} from '../utils/sync.js'

class SyncStatus extends BaseSyncCommand {
    static description = 'Show sync configuration and local/remote drift since the last sync point'

    static examples = ['<%= config.bin %> <%= command.id %>']

    async run(): Promise<void> {
        await this.parse(SyncStatus)
        const state = this.requireSyncState()
        const localConfig = loadConfig(true)
        const remoteConfig = this.readRemoteRegistry(state)
        const localChanges = countConfigChanges(state.lastSyncedConfig, localConfig)
        const remoteChanges = countConfigChanges(state.lastSyncedConfig, remoteConfig)

        let gitStatus = 'Working tree clean'
        try {
            gitStatus = this.git(['status', '--short', '--branch'], state.repoDir) || gitStatus
        } catch (error) {
            gitStatus = error instanceof Error ? `Unable to read git status: ${error.message}` : 'Unable to read git status';
        }

        this.log(`Repo: ${state.repoUrl}`)
        this.log(`Registry file: ${state.registryFile}`)
        this.log(`Local actions: ${Object.keys(localConfig).length}`)
        this.log(`Remote actions: ${Object.keys(remoteConfig).length}`)
        this.log(`Unsynced local changes: Added ${localChanges.added}, Updated ${localChanges.updated}, Removed ${localChanges.removed}`)
        this.log(`Remote changes since last sync: Added ${remoteChanges.added}, Updated ${remoteChanges.updated}, Removed ${remoteChanges.removed}`)
        this.log('')
        this.log(gitStatus)
    }
}

// noinspection JSUnusedGlobalSymbols
export default SyncStatus