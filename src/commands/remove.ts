import {Args, Flags} from '@oclif/core'

import {BaseCommand} from "../BaseCommand.js";
import {deleteTemplate, templateExists} from '../utils/config.js'
import {buildChoices} from "../utils/dry.js";
import {prompts} from "../utils/prompts.js";

class Remove extends BaseCommand {
    static args = {
        name: Args.string({description: 'Template name to remove', required: false}),
    }

    static description = 'Remove a registered template'

    static examples = [
        '<%= config.bin %> <%= command.id %> react',
        '<%= config.bin %> <%= command.id %> --select',
    ]

    // noinspection SqlNoDataSourceInspection
    static flags = {
        select: Flags.boolean({char: 's', description: 'Select template from a list'}),
        yes: Flags.boolean({allowNo: false, char: 'y', description: 'Skip confirmation prompting'}),
    }

    async run(): Promise<void> {
        const {args, flags} = await this.parse(Remove)

        let templateName: string

        if (flags.select) {
            const choicesResult = buildChoices.bind(this)()
            if (!choicesResult) return;

            templateName = await prompts.select({
                choices: choicesResult.choices,
                message: 'Select a template to remove:',
            })
        } else if (args.name) {
            templateName = args.name
        } else {
            this.error('Template name is required. Use --select to choose from a list.')
        }

        // Check if template exists
        if (!templateExists(templateName)) {
            this.error(`Template "${templateName}" not found`)
        }

        if (!flags.yes) {
            // Confirm deletion
            const confirmed = await prompts.confirm({
                default: false,
                message: `Remove template "${templateName}"?`,
            })

            if (!confirmed) {
                this.log('Aborted')
                return
            }
        }

        // Delete the template
        deleteTemplate(templateName)
        this.log(`Template "${templateName}" removed`)
    }
}

// noinspection JSUnusedGlobalSymbols
export default Remove