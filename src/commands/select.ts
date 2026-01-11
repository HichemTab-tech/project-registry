import {Flags} from '@oclif/core'

import {BaseCommand} from "../BaseCommand.js";
import {Template} from '../utils/config.js'
import {buildChoices} from "../utils/dry.js";
import {prompts} from "../utils/prompts.js";
import {runTemplate} from '../utils/runner.js'

class Select extends BaseCommand {
    static description = 'Select and run a template interactively'

    static examples = ['<%= config.bin %> <%= command.id %>']

    static flags = {
        filter: Flags.string({char: 'f', description: 'Filter templates by name (case-insensitive)'})
    }

    async run(): Promise<void> {
        const {flags} = await this.parse(Select)
        const choicesResult = buildChoices.bind(this)(flags.filter?.toLowerCase())
        if (!choicesResult) return;
        const {choices, templates} = choicesResult

        const selectedName = await prompts.select({
            choices,
            message: 'Select a template to run:',
        })

        const template: Template = templates[selectedName]

        this.log(`Running template: ${selectedName}`)
        this.log('')

        const success = await runTemplate(template, {
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