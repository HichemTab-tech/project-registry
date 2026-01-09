import {Args, Command, Flags} from '@oclif/core'

import {getTemplate, templateExists} from '../utils/config.js'
import {runTemplate} from '../utils/runner.js'

class Run extends Command {
    static args = {
        name: Args.string({description: 'Template name to run', required: true}),
    }

    static description = 'Run a registered template'

    static examples = [
        '<%= config.bin %> run react my-app',
        '<%= config.bin %> run react --interactive',
    ]

    static flags = {
        interactive: Flags.boolean({char: 'i', description: 'Interactive mode - prompt for all variables'}),
    }

    static strict = false // Allow variable number of arguments

    async run(): Promise<void> {
        const {args, argv, flags} = await this.parse(Run)

        const templateName = args.name

        // Check if template exists
        if (!templateExists(templateName)) {
            this.error(`Template "${templateName}" not found`)
        }

        const template = getTemplate(templateName)

        if (!template) {
            this.error(`Template "${templateName}" not found`)
        }

        // Get provided variable values from remaining arguments
        const allArgs = argv as string[]
        const providedValues = allArgs.slice(1) // Skip the template name

        const success = await runTemplate(template, {
            interactive: flags.interactive,
            log: (msg) => this.log(msg),
            logError: (msg) => this.error(msg, {exit: false}),
            providedValues,
        })

        if (!success) {
            this.exit(1)
        }
    }
}

// noinspection JSUnusedGlobalSymbols
export default Run