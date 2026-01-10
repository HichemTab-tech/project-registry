import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {setConfigDir} from '../../src/utils/config.js'

describe('remove', () => {
  let testDir: string

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prj-reg-test-'))
    setConfigDir(testDir)
  })

  afterEach(() => {
    fs.rmSync(testDir, {force: true, recursive: true})
  })

  it('removes a template with --yes flag', async () => {
    // Setup - add a template first
    const configPath = path.join(testDir, 'config.json')
    const configData = {
        'keep-me': {
            commands: ['echo hi'],
            description: 'Keep me'
        },
        'to-remove': {
            commands: ['echo bye'],
            description: 'To remove'
        }
    }
    fs.writeFileSync(configPath, JSON.stringify(configData))

    const {stdout} = await runCommand(['remove', 'to-remove', '--yes'])
    expect(stdout).to.contain('Template "to-remove" removed')
    
    const content = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    expect(content['to-remove']).to.not.exist
    expect(content['keep-me']).to.exist
  })

  it('errors if template does not exist', async () => {
    try {
        await runCommand(['remove', 'non-existent', '--yes'])
    } catch (error) {
        expect((error as Error).message).to.contain('not found')
    }
  })
})
