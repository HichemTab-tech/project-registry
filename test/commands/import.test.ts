import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {loadConfig, saveConfig, setConfigDir} from '../../src/utils/config.js'
import {prompts} from '../../src/utils/prompts.js'

describe('import', () => {
  let testDir: string
  let importFile: string
  let originalConfirm: typeof prompts.confirm
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prj-reg-test-'))
    setConfigDir(testDir)

    // Create a dummy import file
    importFile = path.join(testDir, 'import.json')
    fs.writeFileSync(importFile, JSON.stringify({
      'imported-template': {
        commands: ['echo imported'],
      },
    }))

    // Mock prompts
    originalConfirm = prompts.confirm
    prompts.confirm = async () => true

    // Mock fetch
    originalFetch = globalThis.fetch
    // @ts-expect-error Mocking fetch
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({
        'url-template': {
          commands: ['echo url'],
        },
      }),
    })
  })

  afterEach(() => {
    fs.rmSync(testDir, {force: true, recursive: true})
    prompts.confirm = originalConfirm
    globalThis.fetch = originalFetch
  })

  it('imports from file (merge mode)', async () => {
    // Setup existing config
    saveConfig({
      existing: {commands: ['echo existing']},
    })

    const {stdout} = await runCommand(['import', importFile])

    expect(stdout).to.contain('Import completed')

    const config = loadConfig()
    expect(config.existing).to.exist
    expect(config['imported-template']).to.exist
    expect(config['imported-template'].commands).to.deep.equal(['echo imported'])
  })

  it('imports from file (replace mode)', async () => {
    saveConfig({
      'old-template': {commands: ['echo old']},
    })

    const {stdout} = await runCommand(['import', importFile, '--replace'])

    expect(stdout).to.contain('Registry replaced successfully')

    const config = loadConfig()
    expect(config['old-template']).to.not.exist
    expect(config['imported-template']).to.exist
  })

  it('imports from URL', async () => {
    await runCommand(['import', 'https://example.com/templates.json'])

    const config = loadConfig()
    expect(config['url-template']).to.exist
    expect(config['url-template'].commands).to.deep.equal(['echo url'])
  })

  it('fails on invalid JSON file', async () => {
    const invalidFile = path.join(testDir, 'invalid.json')
    fs.writeFileSync(invalidFile, 'invalid json content')

    try {
      const result = await runCommand(['import', invalidFile])
      // If it returns, check if it has error
      if (result.error) {
        expect(result.error.message).to.satisfy((msg: string) => msg.includes('Invalid JSON file') || msg.includes('Failed to parse JSON'))
        return
      }

      // Check if stderr contains the error
      if (result.stderr) {
        expect(result.stderr).to.satisfy((msg: string) => msg.includes('Invalid JSON file') || msg.includes('Failed to parse JSON'))
        return
      }

      expect.fail('Should have failed with error')
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).to.satisfy((msg: string) => msg.includes('Invalid JSON file') || msg.includes('Failed to parse JSON'))
      }
    }
  })
})



