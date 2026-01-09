import {select} from '@inquirer/prompts'
import {Command} from '@oclif/core'

import {Template} from '../utils/config.js'
import {buildChoices} from "../utils/dry.js";
import {runTemplate} from '../utils/runner.js'

class Select extends Command {
    static description = 'Select and run a template interactively'

    static examples = ['<%= config.bin %> <%= command.id %>']

    async run(): Promise<void> {
        const choicesResult = buildChoices.bind(this)()
        if (!choicesResult) return;
        const {choices, templates} = choicesResult

        const selectedName = await select({
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