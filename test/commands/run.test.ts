import {runCommand} from '@oclif/test'
import type {Config} from '@oclif/core'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import commandNotFoundHook from '../../src/hooks/command_not_found.js'
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

    it('runs an action command', async () => {
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

    it('shows the final command without executing it when dry-run is enabled', async () => {
        const outputPath = path.join(testDir, 'dry-run-output.txt')
        const escapedOutputPath = JSON.stringify(outputPath)
        const configPath = path.join(testDir, 'config.json')
        const configData = {
            'test-run': {
                commands: [`node -e "require('node:fs').writeFileSync(${escapedOutputPath}, 'ran')"`],
                description: 'Run test'
            }
        }
        fs.writeFileSync(configPath, JSON.stringify(configData))

        const {stdout} = await runCommand(['run', 'test-run', '--dry-run'])
        expect(stdout).to.contain('$ node -e')
        expect(fs.existsSync(outputPath)).to.equal(false)
    })

    it('shows the final command without executing it when fallback run uses dry-run', async () => {
        const outputPath = path.join(testDir, 'fallback-dry-run-output.txt')
        const escapedOutputPath = JSON.stringify(outputPath)
        const configPath = path.join(testDir, 'config.json')
        const configData = {
            'test-run': {
                commands: [`node -e "require('node:fs').writeFileSync(${escapedOutputPath}, 'ran')"`],
                description: 'Run test'
            }
        }
        fs.writeFileSync(configPath, JSON.stringify(configData))

        const originalArgv = process.argv
        const originalExit = process.exit
        const originalLog = console.log
        const originalError = console.error
        const stdout: string[] = []
        const stderr: string[] = []

        try {
            process.argv = ['node', 'bin/run.js', 'test-run', '--dry-run']
            console.log = (message?: unknown) => {
                stdout.push(String(message ?? ''))
            }
            console.error = (message?: unknown) => {
                stderr.push(String(message ?? ''))
            }
            process.exit = ((code?: number) => {
                throw new Error(`EXIT:${code ?? 0}`)
            }) as typeof process.exit

            await commandNotFoundHook.call({config: {} as Config} as never, {id: 'test-run'} as never)
        } catch (error) {
            if (!(error instanceof Error) || error.message !== 'EXIT:0') {
                throw error
            }
        } finally {
            process.argv = originalArgv
            process.exit = originalExit
            console.log = originalLog
            console.error = originalError
        }

        expect(stdout.join('\n')).to.contain('$ node -e')
        expect(stderr).to.have.length(0)
        expect(fs.existsSync(outputPath)).to.equal(false)
    })
})
