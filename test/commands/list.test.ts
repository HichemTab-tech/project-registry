import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {setConfigDir} from '../../src/utils/config.js'

describe('list', () => {
    let testDir: string

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prj-reg-test-'))
        setConfigDir(testDir)
    })

    afterEach(() => {
        fs.rmSync(testDir, {force: true, recursive: true})
    })

    it('runs list with empty config', async () => {
        const {stdout} = await runCommand(['list'])
        expect(stdout).to.contain('No templates registered')
    })

    it('runs list with existing templates', async () => {
        const configPath = path.join(testDir, 'config.json')
        const configData = {
            'test-template': {
                commands: ['echo hello'],
                description: 'A test template'
            }
        }
        fs.writeFileSync(configPath, JSON.stringify(configData))

        const {stdout} = await runCommand(['list'])
        expect(stdout).to.contain('test-template')
        expect(stdout).to.contain('A test template')
    })
})
