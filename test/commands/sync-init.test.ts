import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import SyncInit from '../../src/commands/sync-init.js'
import {setConfigDir} from '../../src/utils/config.js'
import {loadSyncState} from '../../src/utils/sync.js'

describe('sync-init', () => {
    let testDir: string
    let executedGitCommands: string[][]
    const originalGit = SyncInit.prototype.git

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xcute-sync-init-'))
        executedGitCommands = []
        setConfigDir(testDir)

        SyncInit.prototype.git = (args: string[]) => {
            executedGitCommands.push(args)

            if (args[0] === 'clone') {
                const repoDir = path.join(testDir, 'sync-repo')
                fs.mkdirSync(repoDir, {recursive: true})
                fs.writeFileSync(path.join(repoDir, 'xcute.json'), JSON.stringify({
                    remote: {
                        commands: ['echo remote'],
                    },
                }, null, 2))
            }

            return ''
        }
    })

    afterEach(() => {
        SyncInit.prototype.git = originalGit
        fs.rmSync(testDir, {force: true, recursive: true})
    })

    it('configures sync and stores the initial remote snapshot', async () => {
        const repoUrl = 'git@github.com:example/xcute-sync.git'

        const {stdout} = await runCommand(['sync-init', repoUrl])

        expect(stdout).to.contain(`Sync configured for ${repoUrl}`)
        expect(stdout).to.contain('Remote registry found at xcute.json with 1 actions')
        expect(executedGitCommands).to.deep.equal([
            ['clone', repoUrl, path.join(testDir, 'sync-repo')],
        ])

        const state = loadSyncState()
        expect(state).to.deep.equal({
            lastSyncedConfig: {
                remote: {
                    commands: ['echo remote'],
                },
            },
            registryFile: 'xcute.json',
            repoDir: path.join(testDir, 'sync-repo'),
            repoUrl,
        })
    })
})