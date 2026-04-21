import {spawnSync} from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

import {BaseCommand} from './BaseCommand.js'
import {ConfigData, loadConfig, saveConfig} from './utils/config.js'
import {prompts} from './utils/prompts.js'
import {
    ConflictChoice,
    loadSyncState,
    mergeConfigVersions,
    MergeStrategy,
    parseMergeStrategy,
    readRegistrySnapshot,
    SyncConflict,
    SyncState
} from './utils/sync.js'

export abstract class BaseSyncCommand extends BaseCommand {
    protected getRegistryFilePath(state: SyncState): string {
        return path.join(state.repoDir, state.registryFile)
    }

    git(args: string[], cwd?: string): string {
        const result = spawnSync('git', args, {
            cwd,
            encoding: 'utf8',
        })

        if (result.error) {
            throw result.error
        }

        if (result.status !== 0) {
            throw new Error(result.stderr.trim() || result.stdout.trim() || `git ${args.join(' ')} failed`)
        }

        return result.stdout.trim()
    }

    protected parseStrategy(value: string): MergeStrategy {
        try {
            return parseMergeStrategy(value)
        } catch (error) {
            if (error instanceof Error) {
                this.error(error.message)
            }

            this.error('Invalid merge strategy.')
        }
    }

    protected async promptConflictChoice(conflict: SyncConflict): Promise<ConflictChoice> {
        return prompts.select({
            choices: [
                {
                    description: this.describeAction(conflict.local),
                    name: 'Keep local version',
                    value: 'local',
                },
                {
                    description: this.describeAction(conflict.remote),
                    name: 'Use remote version',
                    value: 'remote',
                },
            ],
            message: `Action "${conflict.name}" changed locally and remotely. Which version should win?`,
        })
    }

    protected pullLatest(state: SyncState): void {
        try {
            this.git(['pull', '--ff-only'], state.repoDir)
        } catch (error) {
            if (error instanceof Error) {
                this.error(`Failed to update sync repo: ${error.message}`)
            }

            this.error('Failed to update sync repo.')
        }
    }

    protected async pullState(flagStrategy: string) {
        const strategy = this.parseStrategy(flagStrategy)
        const state = this.requireSyncState()

        this.pullLatest(state)

        const localConfig = loadConfig(true)
        const remoteConfig = this.readRemoteRegistry(state)
        const {conflicts, merged} = await mergeConfigVersions({
            base: state.lastSyncedConfig,
            local: localConfig,
            remote: remoteConfig,
            resolveConflict: (conflict) => this.promptConflictChoice(conflict),
            strategy,
        })

        saveConfig(merged)
        
        return {
            conflicts,
            localConfig,
            merged,
            remoteConfig,
            state,
        }
    }

    protected readRemoteRegistry(state: SyncState): ConfigData {
        return readRegistrySnapshot(this.getRegistryFilePath(state)) ?? {}
    }

    protected requireSyncState(): SyncState {
        const state = loadSyncState()
        if (!state) {
            this.error('Sync is not configured. Run "xcute sync-init <repo-url>" first.')
        }

        if (!fs.existsSync(state.repoDir)) {
            this.error(`Configured sync repo is missing: ${state.repoDir}`)
        }

        return state
    }
    
    private describeAction(action?: ConfigData[string]): string {
        if (!action) {
            return 'Delete this action'
        }

        const firstCommand = action.commands[0] ?? 'No commands'
        return `${action.commands.length} command(s). First: ${firstCommand}`
    }
}