import {expect} from 'chai'

import {createShellExecutionPlan} from '../../src/utils/runner.js'

describe('runner', () => {
    it('uses the interactive user shell on unix-like systems', () => {
        const executionPlan = createShellExecutionPlan('projx hello', 'linux', '/bin/zsh')

        expect(executionPlan).to.deep.equal({
            command: '/bin/zsh',
            args: ['-i', '-c', 'projx hello'],
        })
    })

    it('falls back to the default shell when no user shell is available', () => {
        const executionPlan = createShellExecutionPlan('projx hello', 'linux', '')

        expect(executionPlan).to.deep.equal({
            command: 'projx hello',
            shell: true,
        })
    })

    it('keeps the default shell execution on windows', () => {
        const executionPlan = createShellExecutionPlan('projx hello', 'win32', '/bin/zsh')

        expect(executionPlan).to.deep.equal({
            command: 'projx hello',
            shell: true,
        })
    })
})