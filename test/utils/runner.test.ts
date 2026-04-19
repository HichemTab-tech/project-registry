import {expect} from 'chai'

import {createShellExecutionPlan, resolveVariableValue} from '../../src/utils/runner.js'

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

    it('uses the provided value directly in non-interactive mode', () => {
        const resolution = resolveVariableValue({
            defaultValue: 'fallback',
            description: 'Project name',
            replacements: ['name::Project name|fallback'],
        }, 'from-argv', false)

        expect(resolution).to.deep.equal({
            shouldPrompt: false,
            value: 'from-argv',
        })
    })

    it('uses the variable default directly in non-interactive mode', () => {
        const resolution = resolveVariableValue({
            defaultValue: 'fallback',
            description: 'Project name',
            replacements: ['name::Project name|fallback'],
        }, undefined, false)

        expect(resolution).to.deep.equal({
            shouldPrompt: false,
            value: 'fallback',
        })
    })

    it('prefills the prompt with the default in interactive mode', () => {
        const resolution = resolveVariableValue({
            defaultValue: 'fallback',
            description: 'Project name',
            replacements: ['name::Project name|fallback'],
        }, undefined, true)

        expect(resolution).to.deep.equal({
            promptDefault: 'fallback',
            shouldPrompt: true,
        })
    })
})