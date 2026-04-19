import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import {
    deleteAction,
    getAllActions,
    getAction,
    setConfigDir,
    setAction,
    actionExists,
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

    it('saves, loads and deletes an action', () => {
        const tpl = {commands: ['echo hi'], description: 'desc'}
        setAction('my-tpl', tpl)

        expect(actionExists('my-tpl')).to.equal(true)

        const loaded = getAction('my-tpl')
        expect(loaded).to.not.be.undefined
        expect(loaded!.commands).to.deep.equal(['echo hi'])
        expect(loaded!.description).to.equal('desc')

        const deleted = deleteAction('my-tpl')
        expect(deleted).to.equal(true)
        expect(actionExists('my-tpl')).to.equal(false)
    })

    it('returns filtered actions with getAllActions', () => {
        setAction('selected', {commands: ['echo a']})
        setAction('other', {commands: ['echo b']})

        const all = getAllActions()
        expect(Object.keys(all)).to.include.members(['selected', 'other'])

        const filtered = getAllActions('sel')
        expect(Object.keys(filtered)).to.deep.equal(['selected'])
    })
})