import {Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import Table from 'cli-table3'
import stripAnsi from 'strip-ansi'

import {BaseCommand} from "../BaseCommand.js";
import {getAllTemplates} from '../utils/config.js'
import {truncate} from "../utils/dry.js";

class List extends BaseCommand {
    static description = 'List all registered templates'

    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> -c'
    ]

    static flags = {
        table: Flags.boolean({allowNo: true, char: 't', default: true, description: 'Show output in table format'}),
        "with-content": Flags.boolean({char: 'c', description: 'With template content'})
    }

    async run(): Promise<void> {
        const {flags} = await this.parse(List)
        const templates = getAllTemplates()
        const names = Object.keys(templates)

        if (names.length === 0) {
            this.log('No templates registered')
            return
        }

        if (flags.table) {
            const headers = ['Name', 'Description']
            if (flags['with-content']) headers.push('Commands')
            const table = new Table({head: headers})

            for (const name of names) {
                const template = templates[name]
                const desc = template.description ? truncate(template.description) : 'No description'
                let row;
                if (flags['with-content']) {
                    const rawCommands = template.commands ? template.commands.join(' && ') : ''
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
            const template = templates[name]
            let result = chalk.green(name)
            if (template.description) {
                const desc = truncate(template.description)
                result += ` ${chalk.yellow('-')} ${desc}`
            } else {
                result += ` ${chalk.yellow('-')} ${chalk.grey('No description')}`
            }

            if (template.commands && flags['with-content']) {
                const rawCommands = template.commands ? template.commands.join(' && ') : ''
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