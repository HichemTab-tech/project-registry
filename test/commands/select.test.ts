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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let selectPromptOptions: any

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prj-reg-test-'))
        setConfigDir(testDir)
        originalSelect = prompts.select
        selectPromptOptions = undefined
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

    it('filters actions using a positional argument', async () => {
        const configPath = path.join(testDir, 'config.json')
        const configData = {
            'build-api': {
                commands: ['echo "api output"'],
                description: 'Build API'
            },
            'deploy-site': {
                commands: ['echo "site output"'],
                description: 'Deploy site'
            }
        }
        fs.writeFileSync(configPath, JSON.stringify(configData))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prompts.select = (async (options: any) => {
            selectPromptOptions = options
            return 'build-api'
        }) as any

        const {stdout} = await runCommand(['select', 'build'])

        expect(selectPromptOptions.choices.map((choice: {value: string}) => choice.value)).to.deep.equal(['build-api'])
        expect(stdout).to.contain('Running action: build-api')
        expect(stdout).to.contain('api output')
    })

    it('filters actions using the select alias positional argument', async () => {
        const configPath = path.join(testDir, 'config.json')
        const configData = {
            'lint-api': {
                commands: ['echo "lint output"'],
                description: 'Lint API'
            },
            'test-api': {
                commands: ['echo "test output"'],
                description: 'Test API'
            }
        }
        fs.writeFileSync(configPath, JSON.stringify(configData))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prompts.select = (async (options: any) => {
            selectPromptOptions = options
            return 'lint-api'
        }) as any

        const {stdout} = await runCommand(['s', 'lint'])

        expect(selectPromptOptions.choices.map((choice: {value: string}) => choice.value)).to.deep.equal(['lint-api'])
        expect(stdout).to.contain('Running action: lint-api')
        expect(stdout).to.contain('lint output')
    })

    it('keeps the -f filter flag working', async () => {
        const configPath = path.join(testDir, 'config.json')
        const configData = {
            'format-api': {
                commands: ['echo "format output"'],
                description: 'Format API'
            },
            'release-api': {
                commands: ['echo "release output"'],
                description: 'Release API'
            }
        }
        fs.writeFileSync(configPath, JSON.stringify(configData))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prompts.select = (async (options: any) => {
            selectPromptOptions = options
            return 'format-api'
        }) as any

        const {stdout} = await runCommand(['select', '-f', 'format'])

        expect(selectPromptOptions.choices.map((choice: {value: string}) => choice.value)).to.deep.equal(['format-api'])
        expect(stdout).to.contain('Running action: format-api')
        expect(stdout).to.contain('format output')
    })
})
