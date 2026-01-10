import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {
    deleteTemplate,
    getAllTemplates,
    getTemplate,
    setConfigDir,
    setTemplate,
    templateExists,
} from '../../src/utils/config.js'

describe('config utilities', () => {
    let testDir: string

    beforeEach(() => {
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prj-reg-test-'))
        setConfigDir(testDir)
    })

    afterEach(() => {
        fs.rmSync(testDir, {force: true, recursive: true})
    })

    it('saves, loads and deletes a template', () => {
        const tpl = {commands: ['echo hi'], description: 'desc'}
        setTemplate('my-tpl', tpl)

        expect(templateExists('my-tpl')).to.equal(true)

        const loaded = getTemplate('my-tpl')
        expect(loaded).to.not.be.undefined
        expect(loaded!.commands).to.deep.equal(['echo hi'])
        expect(loaded!.description).to.equal('desc')

        const deleted = deleteTemplate('my-tpl')
        expect(deleted).to.equal(true)
        expect(templateExists('my-tpl')).to.equal(false)
    })

    it('returns filtered templates with getAllTemplates', () => {
        setTemplate('selected', {commands: ['echo a']})
        setTemplate('other', {commands: ['echo b']})

        const all = getAllTemplates()
        expect(Object.keys(all)).to.include.members(['selected', 'other'])

        const filtered = getAllTemplates('sel')
        expect(Object.keys(filtered)).to.deep.equal(['selected'])
    })
})