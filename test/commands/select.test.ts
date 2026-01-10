import {select} from '@inquirer/prompts'
import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {setConfigDir} from '../../src/utils/config.js'

const prompts = {select}

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

  it('selects and runs a template', async () => {
    // Setup config
    const configPath = path.join(testDir, 'config.json')
    const configData = {
        'selected-template': {
            commands: ['echo "selected output"'],
            description: 'Selected template'
        }
    }
    fs.writeFileSync(configPath, JSON.stringify(configData))

    // Mock prompt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prompts.select = (async () => 'selected-template') as any

    const {stdout} = await runCommand(['select'])
    
    expect(stdout).to.contain('Running template: selected-template')
    expect(stdout).to.contain('selected output')
  })
})
