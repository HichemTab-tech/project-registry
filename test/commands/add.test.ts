import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {setConfigDir} from '../../src/utils/config.js'

describe('add', () => {
    let testDir: string

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prj-reg-test-'))
        setConfigDir(testDir)
    })

    afterEach(() => {
        fs.rmSync(testDir, {force: true, recursive: true})
    })

    it('runs add with arguments', async () => {
        const {stdout} = await runCommand(['add', 'new-template', '"echo hello"', '-d', 'desc'])
        expect(stdout).to.contain('Template "new-template" added')

        const configPath = path.join(testDir, 'config.json')
        const content = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        expect(content['new-template']).to.exist
        expect(content['new-template'].commands).to.deep.equal(['echo hello'])
    })

    it('runs add with arguments and multiple commands', async () => {
        const {stdout} = await runCommand(['add', 'multi-cmd', '"echo 1"', '"echo 2"', '-d', 'desc'])
        expect(stdout).to.contain('Template "multi-cmd" added')

        const configPath = path.join(testDir, 'config.json')
        const content = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        expect(content['multi-cmd'].commands).to.deep.equal(['echo 1', 'echo 2'])
    })

    it('warns when adding a template with a reserved command name', async () => {
        const {stderr} = await runCommand(['add', 'list', '"echo 1"', '-d', 'desc'])
        expect(stderr).to.contain('The template name "list" is reserved')
    })
})
