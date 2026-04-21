import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import SyncStatus from '../../src/commands/sync-status.js'
import {saveConfig, setConfigDir} from '../../src/utils/config.js'
import {saveSyncState} from '../../src/utils/sync.js'

describe('sync-status', () => {
    let testDir: string
    let repoDir: string
    const originalGit = SyncStatus.prototype.git

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xcute-sync-status-'))
        repoDir = path.join(testDir, 'sync-repo')
        fs.mkdirSync(repoDir, {recursive: true})
        setConfigDir(testDir)

        saveConfig({
            addedLocal: {
                commands: ['echo local'],
            },
        })

        fs.writeFileSync(path.join(repoDir, 'xcute.json'), JSON.stringify({
            addedRemote: {
                commands: ['echo remote'],
            },
        }, null, 2))

        saveSyncState({
            lastSyncedConfig: {},
            registryFile: 'xcute.json',
            repoDir,
            repoUrl: 'git@github.com:example/xcute-sync.git',
        })

        SyncStatus.prototype.git = () => '## main...origin/main'
    })

    afterEach(() => {
        SyncStatus.prototype.git = originalGit
        fs.rmSync(testDir, {force: true, recursive: true})
    })

    it('shows sync configuration and drift counts', async () => {
        const {stdout} = await runCommand(['sync-status'])

        expect(stdout).to.contain('Repo: git@github.com:example/xcute-sync.git')
        expect(stdout).to.contain('Registry file: xcute.json')
        expect(stdout).to.contain('Unsynced local changes: Added 1, Updated 0, Removed 0')
        expect(stdout).to.contain('Remote changes since last sync: Added 1, Updated 0, Removed 0')
        expect(stdout).to.contain('## main...origin/main')
    })
})