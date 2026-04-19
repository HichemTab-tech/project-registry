import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {setConfigDir} from '../../src/utils/config.js'
import {prompts} from "../../src/utils/prompts.js";

describe('select', () => {
    let testDir: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let originalSelect: any

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prj-reg-test-'))
        setConfigDir(testDir)
        originalSelect = prompts.select
    })

    afterEach(() => {
        fs.rmSync(testDir, {force: true, recursive: true})
        prompts.select = originalSelect
    })

    it('selects and runs an action', async () => {
        // Setup config
        const configPath = path.join(testDir, 'config.json')
        const configData = {
            'selected-action': {
                commands: ['echo "selected output"'],
                description: 'Selected action'
            }
        }
        fs.writeFileSync(configPath, JSON.stringify(configData))

        // Mock prompt
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prompts.select = (async () => 'selected-action') as any

        const {stdout} = await runCommand(['select'])

        expect(stdout).to.contain('Running action: selected-action')
        expect(stdout).to.contain('selected output')
    })
})
