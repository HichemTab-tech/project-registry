import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {saveConfig, setConfigDir} from '../../src/utils/config.js'

describe('export', () => {
  let testDir: string
  let outputDir: string

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prj-reg-test-'))
    outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prj-reg-output-'))
    setConfigDir(testDir)
    
    // Setup initial config
    saveConfig({
        'test-template': {
            commands: ['echo test']
        }
    })
  })

  afterEach(() => {
    fs.rmSync(testDir, {force: true, recursive: true})
    fs.rmSync(outputDir, {force: true, recursive: true})
  })

  it('exports registry to a file', async () => {
    const outputFile = path.join(outputDir, 'backup.json')
    const {stdout} = await runCommand(['export', outputFile])
    
    expect(stdout).to.contain(`Registry exported to ${outputFile}`)
    expect(fs.existsSync(outputFile)).to.be.true
    
    const content = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
    expect(content['test-template']).to.exist
    expect(content['test-template'].commands).to.deep.equal(['echo test'])
  })

  it('exports registry to a directory', async () => {
    const {stdout} = await runCommand(['export', outputDir])
    
    const expectedFile = path.join(outputDir, 'project-registry.json')
    expect(stdout).to.contain(`Registry exported to ${expectedFile}`)
    expect(fs.existsSync(expectedFile)).to.be.true
    
    const content = JSON.parse(fs.readFileSync(expectedFile, 'utf8'))
    expect(content['test-template']).to.exist
  })
})
