import {Command} from '@oclif/core'

import {getAllTemplates} from '../utils/config.js'

class List extends Command {
    static description = 'List all registered templates'

    static examples = ['<%= config.bin %> <%= command.id %>']

    async run(): Promise<void> {
        const templates = getAllTemplates()
        const names = Object.keys(templates)

        if (names.length === 0) {
            this.log('No templates registered')
            return
        }

        for (const name of names) {
            const template = templates[name]
            if (template.description) {
                this.log(`${name} - ${template.description}`)
            } else {
                this.log(name)
            }
        }
    }
}

// noinspection JSUnusedGlobalSymbols
export default List