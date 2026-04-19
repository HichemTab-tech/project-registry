import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {getCustomConfig, setConfigDir, setIncludePresets} from '../../src/utils/config.js'

describe('list', () => {
    let testDir: string
    const originalIncludePresent = getCustomConfig().includePresets
    const originalDir = getCustomConfig().customDir

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prj-reg-test-'))
        setConfigDir(testDir)
        setIncludePresets(false);
    })

    afterEach(() => {
        fs.rmSync(testDir, {force: true, recursive: true})
        setIncludePresets(originalIncludePresent)
        setConfigDir(originalDir)
    })

    it('runs list with empty config', async () => {
        const {stdout} = await runCommand(['list'])
        expect(stdout).to.contain('No actions registered')
    })

    it('runs list with existing actions', async () => {
        const configPath = path.join(testDir, 'config.json')
        const configData = {
            'test-action': {
                commands: ['echo hello'],
                description: 'A test action'
            }
        }
        fs.writeFileSync(configPath, JSON.stringify(configData))

        const {stdout} = await runCommand(['list'])
        expect(stdout).to.contain('test-action')
        expect(stdout).to.contain('A test action')
    })
})
