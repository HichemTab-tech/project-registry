import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import MigrateFromProjx from '../../src/commands/migrate-from-projx.js'
import {prompts} from '../../src/utils/prompts.js'
import {setConfigDir} from '../../src/utils/config.js'

describe('migrate-from-projx', () => {
    let testDir: string
    let legacyDir: string
    let originalConfirm: typeof prompts.confirm
    let originalGetLegacyConfigDir: typeof MigrateFromProjx.prototype.getLegacyConfigDir
    let originalHasLegacyGlobalInstall: typeof MigrateFromProjx.prototype.hasLegacyGlobalInstall
    let originalExec: typeof MigrateFromProjx.prototype.exec

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xcute-test-'))
        legacyDir = path.join(testDir, '.project-registry')
        fs.mkdirSync(legacyDir, {recursive: true})
        setConfigDir(path.join(testDir, '.xcute'))

        originalConfirm = prompts.confirm
        originalGetLegacyConfigDir = MigrateFromProjx.prototype.getLegacyConfigDir
        originalHasLegacyGlobalInstall = MigrateFromProjx.prototype.hasLegacyGlobalInstall
        originalExec = MigrateFromProjx.prototype.exec

        MigrateFromProjx.prototype.getLegacyConfigDir = () => legacyDir
    })

    afterEach(() => {
        prompts.confirm = originalConfirm
        MigrateFromProjx.prototype.getLegacyConfigDir = originalGetLegacyConfigDir
        MigrateFromProjx.prototype.hasLegacyGlobalInstall = originalHasLegacyGlobalInstall
        MigrateFromProjx.prototype.exec = originalExec
        fs.rmSync(testDir, {force: true, recursive: true})
    })

    it('migrates the legacy config and optionally uninstalls the old package', async () => {
        fs.writeFileSync(path.join(legacyDir, 'config.json'), JSON.stringify({
            projx: {
                commands: ['projx run app', 'echo projx-run'],
                description: 'projx command',
            },
        }, null, 2))

        fs.mkdirSync(path.join(testDir, '.xcute'), {recursive: true})
        fs.writeFileSync(path.join(testDir, '.xcute', 'config.json'), JSON.stringify({
            existing: {
                commands: ['echo keep'],
            },
            xcute: {
                commands: ['echo keep-current'],
            },
        }, null, 2))

        prompts.confirm = async () => true
        MigrateFromProjx.prototype.hasLegacyGlobalInstall = () => true

        const executedCommands: string[] = []
        MigrateFromProjx.prototype.exec = (command: string) => {
            executedCommands.push(command)
            return Buffer.from('removed old package')
        }

        const {stdout} = await runCommand(['migrate-from-projx'])

        expect(stdout).to.contain('Migrated legacy config into')
        expect(stdout).to.contain('Global package "project-registry" removed.')
        expect(executedCommands).to.deep.equal(['npm uninstall project-registry -g'])
        expect(fs.existsSync(path.join(legacyDir, 'config.json'))).to.equal(false)

        const migratedConfig = JSON.parse(fs.readFileSync(path.join(testDir, '.xcute', 'config.json'), 'utf8'))
        expect(migratedConfig.existing).to.exist
        expect(migratedConfig.xcute).to.deep.equal({commands: ['echo keep-current']})
        expect(migratedConfig['projx']).to.not.exist
        expect(migratedConfig['xcute'].commands[0]).to.equal('echo keep-current')
        expect(migratedConfig['xcute'].description).to.not.exist
    })

    it('migrates config content and leaves non-standalone projx text unchanged', async () => {
        fs.writeFileSync(path.join(legacyDir, 'config.json'), JSON.stringify({
            projx: {
                commands: ['projx run app', 'echo projx-run', 'echo myprojx'],
                description: 'projx command',
            },
        }, null, 2))

        prompts.confirm = async () => true
        MigrateFromProjx.prototype.hasLegacyGlobalInstall = () => false

        const {stdout} = await runCommand(['migrate-from-projx'])

        expect(stdout).to.contain('Migrated legacy config to')

        const migratedConfig = JSON.parse(fs.readFileSync(path.join(testDir, '.xcute', 'config.json'), 'utf8'))
        expect(migratedConfig.xcute.commands).to.deep.equal(['xcute run app', 'echo projx-run', 'echo myprojx'])
        expect(migratedConfig.xcute.description).to.equal('xcute command')
    })

    it('skips the uninstall prompt when the old package is not installed', async () => {
        fs.writeFileSync(path.join(legacyDir, 'config.json'), JSON.stringify({
            action: {
                commands: ['echo ok'],
            },
        }, null, 2))

        let confirmCalled = false
        prompts.confirm = async () => {
            confirmCalled = true
            return true
        }

        MigrateFromProjx.prototype.hasLegacyGlobalInstall = () => false

        await runCommand(['migrate-from-projx'])

        expect(confirmCalled).to.equal(false)
    })

    it('detects a legacy global install from pnpm when npm does not have it', () => {
        const npmRoot = path.join(testDir, 'npm-global')
        const pnpmRoot = path.join(testDir, 'pnpm-global')
        fs.mkdirSync(npmRoot, {recursive: true})
        fs.mkdirSync(path.join(pnpmRoot, 'project-registry'), {recursive: true})

        const executedCommands: string[] = []
        const hasLegacyInstall = MigrateFromProjx.prototype.hasLegacyGlobalInstall.call({
            exec(command: string) {
                executedCommands.push(command)
                if (command === 'npm root -g') {
                    return Buffer.from(npmRoot)
                }

                if (command === 'pnpm root -g') {
                    return Buffer.from(pnpmRoot)
                }

                throw new Error(`Unexpected command: ${command}`)
            },
        } as MigrateFromProjx)

        expect(hasLegacyInstall).to.equal(true)
        expect(executedCommands).to.deep.equal(['npm root -g', 'pnpm root -g'])
    })

    it('returns false when neither npm nor pnpm has the legacy package', () => {
        const npmRoot = path.join(testDir, 'npm-global')
        const pnpmRoot = path.join(testDir, 'pnpm-global')
        fs.mkdirSync(npmRoot, {recursive: true})
        fs.mkdirSync(pnpmRoot, {recursive: true})

        const hasLegacyInstall = MigrateFromProjx.prototype.hasLegacyGlobalInstall.call({
            exec(command: string) {
                if (command === 'npm root -g') {
                    return Buffer.from(npmRoot)
                }

                if (command === 'pnpm root -g') {
                    return Buffer.from(pnpmRoot)
                }

                throw new Error(`Unexpected command: ${command}`)
            },
        } as MigrateFromProjx)

        expect(hasLegacyInstall).to.equal(false)
    })
})