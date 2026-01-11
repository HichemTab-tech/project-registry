import {expect} from 'chai'

import {extractVariables, replaceAllVariables, replaceVariables} from '../../src/utils/variables.js'

describe('variables', () => {
  describe('extractVariables', () => {
    it('should extract single variable', () => {
      const result = extractVariables(['echo {{name}}'])
      expect([...result.keys()]).to.deep.equal(['name'])
    })

    it('should extract multiple variables from single command', () => {
      const result = extractVariables(['echo {{name}} {{version}}'])
      expect([...result.keys()]).to.deep.equal(['name', 'version'])
    })

    it('should extract variables from multiple commands', () => {
      const result = extractVariables(['mkdir {{name}}', 'cd {{name}}', 'echo {{author}}'])
      expect([...result.keys()]).to.deep.equal(['name', 'author'])
    })

    it('should return unique variables in order of first appearance', () => {
      const result = extractVariables(['{{a}} {{b}} {{a}}', '{{c}} {{b}}'])
      expect([...result.keys()]).to.deep.equal(['a', 'b', 'c'])
    })

    it('should return empty array for commands without variables', () => {
      const result = extractVariables(['echo hello', 'ls -la'])
      expect([...result.keys()]).to.deep.equal([])
    })

    it('should handle empty command array', () => {
      const result = extractVariables([])
      expect([...result.keys()]).to.deep.equal([])
    })
  })

  describe('replaceVariables', () => {
    it('should replace single variable', () => {
      const result = replaceVariables('echo {{name}}', {name: {replacements: ['name'], result: 'my-project'}})
      expect(result).to.equal('echo my-project')
    })

    it('should replace multiple variables', () => {
      const result = replaceVariables('{{cmd}} {{name}} --version {{ver}}', {
        cmd: {replacements: ['cmd'], result: 'npm'},
        name: {replacements: ['name'], result: 'test'},
        ver: {replacements: ['ver'], result: '1.0.0'},
      })
      expect(result).to.equal('npm test --version 1.0.0')
    })

    it('should keep unreplaced variables as-is', () => {
      const result = replaceVariables('echo {{name}} {{unknown}}', {name: {replacements: ['name'], result: 'test'}})
      expect(result).to.equal('echo test {{unknown}}')
    })

    it('should handle command without variables', () => {
      const result = replaceVariables('echo hello', {name: {replacements: ['name'], result: 'test'}})
      expect(result).to.equal('echo hello')
    })
  })

  describe('replaceAllVariables', () => {
    it('should replace variables in all commands', () => {
      const result = replaceAllVariables(
        ['mkdir {{name}}', 'cd {{name}}', 'npm init'],
        {name: {replacements: ['name'], result: 'my-app'}}
      )
      expect(result).to.deep.equal(['mkdir my-app', 'cd my-app', 'npm init'])
    })

    it('should handle empty command array', () => {
      const result = replaceAllVariables([], {name: {replacements: ['name'], result: 'test'}})
      expect(result).to.deep.equal([])
    })
  })
})
