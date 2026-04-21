import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import SyncPull from '../../src/commands/sync-pull.js'
import {saveConfig, setConfigDir} from '../../src/utils/config.js'
import {saveSyncState} from '../../src/utils/sync.js'

describe('sync-pull', () => {
    let testDir: string
    let repoDir: string
    let executedGitCommands: string[][]
    const originalGit = SyncPull.prototype.git

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xcute-sync-pull-'))
        repoDir = path.join(testDir, 'sync-repo')
        executedGitCommands = []
        fs.mkdirSync(repoDir, {recursive: true})
        setConfigDir(testDir)

        saveConfig({
            shared: {
                commands: ['echo local'],
            },
        })

        fs.writeFileSync(path.join(repoDir, 'xcute.json'), JSON.stringify({
            shared: {
                commands: ['echo remote'],
            },
        }, null, 2))

        saveSyncState({
            lastSyncedConfig: {
                shared: {
                    commands: ['echo base'],
                },
            },
            registryFile: 'xcute.json',
            repoDir,
            repoUrl: 'git@github.com:example/xcute-sync.git',
        })

        SyncPull.prototype.git = (args: string[]) => {
            executedGitCommands.push(args)

            if (args[0] === 'ls-remote') {
                return 'abc123\trefs/heads/main'
            }

            return ''
        }
    })

    afterEach(() => {
        SyncPull.prototype.git = originalGit
        fs.rmSync(testDir, {force: true, recursive: true})
    })

    it('pulls remote changes into the local registry using the selected strategy', async () => {
        const {stdout} = await runCommand(['sync-pull', '--strategy', 'remote'])

        expect(stdout).to.contain('Sync pull complete. Added: 0, Updated: 1, Removed: 0, Conflicts: 1')
        expect(executedGitCommands).to.deep.equal([
            ['ls-remote', '--heads', 'origin'],
            ['pull', '--ff-only'],
        ])

        const config = JSON.parse(fs.readFileSync(path.join(testDir, 'config.json'), 'utf8'))
        expect(config.shared.commands).to.deep.equal(['echo remote'])
    })
})