import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {setConfigDir} from '../../src/utils/config.js'

describe('run', () => {
    let testDir: string

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prj-reg-test-'))
        setConfigDir(testDir)
    })

    afterEach(() => {
        fs.rmSync(testDir, {force: true, recursive: true})
    })

    it('runs a template command', async () => {
        const configPath = path.join(testDir, 'config.json')
        const configData = {
            'test-run': {
                commands: ['echo "run test output"'],
                description: 'Run test'
            }
        }
        fs.writeFileSync(configPath, JSON.stringify(configData))

        const {stdout} = await runCommand(['run', 'test-run'])
        expect(stdout).to.contain('run test output')
    })
})
