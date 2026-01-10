import {expect} from 'chai'

import {truncate} from '../../src/utils/dry.js'

describe('dry utilities', () => {
  describe('truncate', () => {
    it('should return empty string for undefined', () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(truncate(undefined)).to.equal('')
    })

    it('should return empty string for empty string', () => {
      expect(truncate('')).to.equal('')
    })

    it('should return original string if shorter than limit', () => {
      expect(truncate('hello', 10)).to.equal('hello')
    })

    it('should return original string if equal to limit', () => {
      expect(truncate('hello', 5)).to.equal('hello')
    })

    it('should truncate and add ellipsis if longer than limit', () => {
      expect(truncate('hello world', 5)).to.equal('hello...')
    })

    it('should use default limit of 100', () => {
      const longString = 'a'.repeat(150)
      const result = truncate(longString)
      expect(result).to.equal('a'.repeat(100) + '...')
    })
  })
})
