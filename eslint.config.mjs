import {includeIgnoreFile} from '@eslint/compat'
import oclif from 'eslint-config-oclif'
import prettier from 'eslint-config-prettier'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const gitignorePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.gitignore')

export default [includeIgnoreFile(gitignorePath), ...oclif, prettier, {
    rules: {
        '@stylistic/lines-between-class-members': 'off',
        'n/no-process-exit': 'off',
        'no-await-in-loop': 'off',
        'unicorn/filename-case': 'off',
        'unicorn/import-style': 'off',
        'unicorn/no-process-exit': 'off'
    }
}]
