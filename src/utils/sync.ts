import * as fs from 'node:fs'
import * as path from 'node:path'

import {Action, ConfigData, getConfigDir} from './config.js'

export interface SyncState {
    lastSyncedConfig: ConfigData
    registryFile: string
    repoDir: string
    repoUrl: string
}

export interface SyncConflict {
    base?: Action
    local?: Action
    name: string
    remote?: Action
}

export type MergeStrategy = 'local' | 'prompt' | 'remote'
export type ConflictChoice = 'local' | 'remote'

export interface MergeOutcome {
    conflicts: SyncConflict[]
    merged: ConfigData
}

export interface ConfigChangeCount {
    added: number
    removed: number
    updated: number
}

export function getSyncRepoDir(): string {
    return path.join(getConfigDir(), 'sync-repo')
}

export function getSyncStateFile(): string {
    return path.join(getConfigDir(), 'sync.json')
}

export function loadSyncState(): SyncState | undefined {
    const file = getSyncStateFile()
    if (!fs.existsSync(file)) {
        return undefined
    }

    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`Invalid sync state format in ${file}`)
    }

    const candidate = parsed as Partial<SyncState>
    if (typeof candidate.repoUrl !== 'string' || typeof candidate.repoDir !== 'string' || typeof candidate.registryFile !== 'string') {
        throw new TypeError(`Invalid sync state format in ${file}`)
    }

    return {
        lastSyncedConfig: validateConfigData(candidate.lastSyncedConfig ?? {}, `${file}#lastSyncedConfig`),
        registryFile: candidate.registryFile,
        repoDir: candidate.repoDir,
        repoUrl: candidate.repoUrl,
    }
}

export function saveSyncState(state: SyncState): void {
    fs.mkdirSync(path.dirname(getSyncStateFile()), {recursive: true})
    fs.writeFileSync(getSyncStateFile(), JSON.stringify(state, null, 2), 'utf8')
}

export function parseConfigData(rawData: string, source: string): ConfigData {
    let parsed: unknown

    try {
        parsed = JSON.parse(rawData)
    } catch (error) {
        if (error instanceof Error) {
            throw new TypeError(`Failed to parse JSON from ${source}: ${error.message}`)
        }

        throw new Error(`Failed to parse JSON from ${source}`)
    }

    return validateConfigData(parsed, source)
}

export function readRegistrySnapshot(filePath: string): ConfigData | undefined {
    if (!fs.existsSync(filePath)) {
        return undefined
    }

    return parseConfigData(fs.readFileSync(filePath, 'utf8'), filePath)
}

export function writeRegistrySnapshot(filePath: string, config: ConfigData): void {
    fs.mkdirSync(path.dirname(filePath), {recursive: true})
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8')
}

export async function mergeConfigVersions(options: {
    base: ConfigData
    local: ConfigData
    remote: ConfigData
    resolveConflict?: (conflict: SyncConflict) => Promise<ConflictChoice>
    strategy: MergeStrategy
}): Promise<MergeOutcome> {
    const {base, local, remote, resolveConflict, strategy} = options
    const conflicts: SyncConflict[] = []
    const merged: ConfigData = {}
    const names = new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)])

    for (const name of names) {
        const baseAction = base[name]
        const localAction = local[name]
        const remoteAction = remote[name]

        if (actionEquals(localAction, remoteAction)) {
            if (localAction) {
                const clonedAction = cloneAction(localAction)
                if (clonedAction) {
                    merged[name] = clonedAction
                }
            }

            continue
        }

        if (actionEquals(localAction, baseAction)) {
            if (remoteAction) {
                const clonedAction = cloneAction(remoteAction)
                if (clonedAction) {
                    merged[name] = clonedAction
                }
            }

            continue
        }

        if (actionEquals(remoteAction, baseAction)) {
            if (localAction) {
                const clonedAction = cloneAction(localAction)
                if (clonedAction) {
                    merged[name] = clonedAction
                }
            }

            continue
        }

        const conflict: SyncConflict = {
            base: cloneAction(baseAction),
            local: cloneAction(localAction),
            name,
            remote: cloneAction(remoteAction),
        }
        conflicts.push(conflict)

        let choice: ConflictChoice
        if (strategy === 'local') {
            choice = 'local'
        } else if (strategy === 'remote') {
            choice = 'remote'
        } else {
            if (!resolveConflict) {
                throw new Error('Prompt strategy requires a conflict resolver')
            }

            choice = await resolveConflict(conflict)
        }

        const selected = choice === 'local' ? localAction : remoteAction
        if (selected) {
            const clonedAction = cloneAction(selected)
            if (clonedAction) {
                merged[name] = clonedAction
            }
        }
    }

    return {conflicts, merged}
}

export function countConfigChanges(source: ConfigData, target: ConfigData): ConfigChangeCount {
    let added = 0
    let removed = 0
    let updated = 0
    const names = new Set([...Object.keys(source), ...Object.keys(target)])

    for (const name of names) {
        const before = source[name]
        const after = target[name]

        if (!before && after) {
            added++
            continue
        }

        if (before && !after) {
            removed++
            continue
        }

        if (before && after && !actionEquals(before, after)) {
            updated++
        }
    }

    return {added, removed, updated}
}

export function parseMergeStrategy(value: string): MergeStrategy {
    if (value === 'local' || value === 'prompt' || value === 'remote') {
        return value
    }

    throw new Error(`Invalid merge strategy: ${value}. Use local, remote, or prompt.`)
}

function validateConfigData(data: unknown, source: string): ConfigData {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error(`Invalid registry format in ${source}: root must be an object`)
    }

    const config = data as Record<string, unknown>
    for (const [name, value] of Object.entries(config)) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw new Error(`Invalid entry "${name}" in ${source}: must be an object`)
        }

        const action = value as NonNullable<unknown>
        if (!("commands" in action) || !Array.isArray(action.commands)) {
            throw new Error(`Invalid entry "${name}" in ${source}: must have "commands" array`)
        }

        if (!action.commands.every((command) => typeof command === 'string')) {
            throw new Error(`Invalid entry "${name}" in ${source}: commands must be strings`)
        }

        if ("description" in action && action.description !== undefined && typeof action.description !== 'string') {
            throw new Error(`Invalid entry "${name}" in ${source}: description must be a string`)
        }
    }

    return data as ConfigData
}

function actionEquals(left?: Action, right?: Action): boolean {
    return JSON.stringify(normalizeAction(left)) === JSON.stringify(normalizeAction(right))
}

function cloneAction(action?: Action): Action | undefined {
    if (!action) {
        return undefined
    }

    return {
        commands: [...action.commands],
        ...(action.description === undefined ? {} : {description: action.description}),
    }
}

function normalizeAction(action?: Action): Action | undefined {
    if (!action) {
        return undefined
    }

    return cloneAction(action)
}