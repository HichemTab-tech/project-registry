import {Flags} from '@oclif/core'
import chalk from 'chalk'
import Table from 'cli-table3'
import stripAnsi from 'strip-ansi'

import {BaseCommand} from "../BaseCommand.js";
import {getAllActions} from '../utils/config.js'
import {truncate} from "../utils/dry.js";

class List extends BaseCommand {
    static description = 'List all registered actions'

    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> -c',
        '<%= config.bin %> <%= command.id %> -f react'
    ]

    static flags = {
        filter: Flags.string({char: 'f', description: 'Filter actions by name (case-insensitive)'}),
        table: Flags.boolean({allowNo: true, char: 't', default: true, description: 'Show output in table format'}),
        "with-content": Flags.boolean({char: 'c', description: 'With action content'})
    }

    async run(): Promise<void> {
        const {flags} = await this.parse(List)
        const actions = getAllActions(flags.filter)
        const names = Object.keys(actions)

        if (names.length === 0) {
            this.log('No actions registered')
            return
        }

        if (flags.table) {
            const headers = ['Name', 'Description']
            if (flags['with-content']) headers.push('Commands')
            const table = new Table({head: headers})

            for (const name of names) {
                const action = actions[name]
                const desc = action.description ? truncate(action.description) : 'No description'
                let row;
                if (flags['with-content']) {
                    const rawCommands = action.commands ? action.commands.join(' && ') : ''
                    const truncated = truncate(stripAnsi(rawCommands))
                    const coloredCommands = truncated.split(' && ').join(chalk.cyan(' && '))
                    row = [chalk.green(name), desc, coloredCommands]
                }
                else{
                    row = [chalk.green(name), desc]
                }

                table.push(row)
            }

            this.log(table.toString())
            return
        }

        for (const name of names) {
            const action = actions[name]
            let result = chalk.green(name)
            if (action.description) {
                const desc = truncate(action.description)
                result += ` ${chalk.yellow('-')} ${desc}`
            } else {
                result += ` ${chalk.yellow('-')} ${chalk.grey('No description')}`
            }

            if (action.commands && flags['with-content']) {
                const rawCommands = action.commands ? action.commands.join(' && ') : ''
                const truncated = truncate(stripAnsi(rawCommands))
                const coloredCommands = truncated.split(' && ').join(chalk.cyan(' && '))
                result += ` ${chalk.yellow('-')} ${coloredCommands}`
            }

            this.log(result)
        }
    }
}

// noinspection JSUnusedGlobalSymbols
export default List