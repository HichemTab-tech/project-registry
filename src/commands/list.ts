import {Command, Flags} from '@oclif/core'

import {getAllTemplates} from '../utils/config.js'

class List extends Command {
    static description = 'List all registered templates'

    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> -c'
    ]

    static flags = {
        "with-content": Flags.string({char: 'c', description: 'With template content'}),
    }

    async run(): Promise<void> {
        const templates = getAllTemplates()
        const names = Object.keys(templates)

        if (names.length === 0) {
            this.log('No templates registered')
            return
        }

        for (const name of names) {
            const template = templates[name]
            let result = name;
            if (template.description) {
                if (template.description.length > 100) template.description = template.description.slice(0, 100) + '...'
                result += ` - ${template.description}`
            }
            else{
                result += ` - No description`
            }

            if (template.commands) {
                let commands = template.commands.join(' && ')
                if (commands.length > 100) commands = commands.slice(0, 100) + '...'
                result += ` - ${commands}`
            }

            this.log(result)
        }
    }
}

// noinspection JSUnusedGlobalSymbols
export default List