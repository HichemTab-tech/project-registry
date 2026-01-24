import {runCommand} from '@oclif/test'
import {expect} from 'chai'

import SelfUpdate from '../../src/commands/self-update.js'

describe('self-update', () => {
    let executedCommands: string[] = [];
    const originalExec = SelfUpdate.prototype.exec;

    beforeEach(() => {
        executedCommands = [];
        // Stub the exec method on the prototype
        SelfUpdate.prototype.exec = (command: string) => {
            executedCommands.push(command);
            return Buffer.from('mock output');
        };
    })

    afterEach(() => {
        // Restore the original method
        SelfUpdate.prototype.exec = originalExec;
    })

    it('runs self-update with default pnpm', async () => {
        const {stdout} = await runCommand(['self-update'])
        expect(stdout).to.contain('Updating from:')
        expect(stdout).to.contain('mock output')
        expect(executedCommands).to.include('pnpm add projx@latest -g')
    })

    it('runs self-update with npm', async () => {
        await runCommand(['self-update', 'npm'])
        expect(executedCommands).to.include('npm install -g projx@latest')
    })

    it('runs self-update with yarn', async () => {
        await runCommand(['self-update', 'yarn'])
        expect(executedCommands).to.include('yarn global add projx@latest')
    })

    it('runs self-update with pnpm explicit', async () => {
        await runCommand(['self-update', 'pnpm'])
        expect(executedCommands).to.include('pnpm add projx@latest -g')
    })

    it('fails gracefully on error', async () => {
        SelfUpdate.prototype.exec = () => { throw new Error('fail'); }
        const {error} = await runCommand(['self-update'])
        expect(error?.message).to.contain('Failed to update projx: fail')
    })
})
