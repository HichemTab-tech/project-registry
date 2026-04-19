import {Args, Flags} from '@oclif/core'

import {BaseCommand} from "../BaseCommand.js";
import {actionExists, getAction} from '../utils/config.js'
import {runAction} from '../utils/runner.js'

class Run extends BaseCommand {
    static args = {
        name: Args.string({description: 'Action name to run', required: true}),
    }

    static description = 'Run a registered action'

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

        const actionName = args.name

        // Check if action exists
        if (!actionExists(actionName)) {
            this.error(`Action "${actionName}" not found`)
        }

        const action = getAction(actionName)

        if (!action) {
            this.error(`Action "${actionName}" not found`)
        }

        // Get provided variable values from remaining arguments
        const allArgs = argv as string[]
        const providedValues = allArgs.slice(1) // Skip the action name

        const success = await runAction(action, {
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