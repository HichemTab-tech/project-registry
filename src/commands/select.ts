import {Args, Flags} from '@oclif/core'

import {BaseCommand} from "../BaseCommand.js";
import {Action} from '../utils/config.js'
import {buildChoices} from "../utils/dry.js";
import {prompts} from "../utils/prompts.js";
import {runAction} from '../utils/runner.js'

class Select extends BaseCommand {
    static aliases = ['s']

    static args = {
        filter: Args.string({description: 'Filter actions by name (case-insensitive)', required: false}),
    }

    static description = 'Select and run an action interactively'

    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> build',
        '<%= config.bin %> s build',
    ]

    static flags = {
        filter: Flags.string({char: 'f', description: 'Filter actions by name (case-insensitive)'})
    }

    async run(): Promise<void> {
        const {args, flags} = await this.parse(Select)
        const filter = flags.filter ?? args.filter
        const choicesResult = buildChoices.bind(this)(filter?.toLowerCase())
        if (!choicesResult) return;
        const {actions, choices} = choicesResult

        const selectedName = await prompts.select({
            choices,
            message: 'Select an action to run:',
        })

        const action: Action = actions[selectedName]

        this.log(`Running action: ${selectedName}`)
        this.log('')

        const success = await runAction(action, {
            log: (msg) => this.log(msg),
            logError: (msg) => this.error(msg, {exit: false}),
            providedValues: [],
        })

        if (!success) {
            this.exit(1)
        }
    }
}

// noinspection JSUnusedGlobalSymbols
export default Select