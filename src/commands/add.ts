import {Args, Flags} from '@oclif/core'
import chalk from "chalk";

import {BaseCommand} from "../BaseCommand.js";
import {setTemplate, templateExists} from '../utils/config.js'
import {prompts} from "../utils/prompts.js";

class Add extends BaseCommand {
    static args = {
        name: Args.string({description: 'Template name', required: false}),
    }

    static description = 'Register a new project template'

    static examples = [
        '<%= config.bin %> <%= command.id %> react "pnpm dlx create-vite {{name}}" "cd {{name}}" "pnpm install"',
        '<%= config.bin %> <%= command.id %> --interactive',
    ]

    static flags = {
        description: Flags.string({char: 'd', description: 'Template description'}),
    }

    static strict = false // Allow variable number of arguments

    async run(): Promise<void> {
        const {args, argv, flags} = await this.parse(Add)

        let {description} = flags

        const templateName = args.name ?? await prompts.input({message: 'Template name:'})

        if (!templateName.trim()) {
            this.error('Template name is required')
        }

        const reservedCommands = Object.values(this.config.commands).map(c => c.id);

        if (reservedCommands.includes(templateName)) {
            this.warn(`The template name "${templateName}" is reserved. To use it in future, you should use the "run" command like ${chalk.yellow(`projx run ${templateName}`)}, instead of ${chalk.yellow(`projx ${templateName}`)}.`)
        }

        this.log('Enter commands (one per line, empty line to finish):')

        // Get commands from remaining arguments (argv includes all args including the name)
        const allArgs = argv as string[]
        const commands = allArgs.slice(1) // Skip the template name

        if (commands.length === 0) {
            while (true) {
                const cmd = await prompts.input({message: '>'})
                if (cmd.trim() === '') {
                    break
                }

                commands.push(cmd)
            }
        }

        if (commands.length === 0) {
            this.error('At least one command is required')
        }

        if (!description) {
            description = await prompts.input({message: 'Description (optional):'})
        }

        // Check if the template already exists
        if (templateExists(templateName)) {
            const overwrite = await prompts.confirm({
                default: false,
                message: `Template "${templateName}" already exists. Overwrite?`,
            })

            if (!overwrite) {
                this.log('Aborted')
                return
            }
        }

        // Save the template
        setTemplate(templateName, {
            commands,
            ...(description && {description}),
        })

        this.log(`Template "${templateName}" added with ${commands.length} command(s)`)
    }
}

// noinspection JSUnusedGlobalSymbols
export default Add