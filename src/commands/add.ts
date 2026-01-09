import {confirm, input} from '@inquirer/prompts'
import {Args, Command, Flags} from '@oclif/core'

import {setTemplate, templateExists} from '../utils/config.js'

class Add extends Command {
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
        interactive: Flags.boolean({char: 'i', description: 'Interactive mode'}),
    }

    static strict = false // Allow variable number of arguments

    async run(): Promise<void> {
        const {args, argv, flags} = await this.parse(Add)

        let templateName: string
        let commands: string[]
        let {description} = flags

        if (flags.interactive) {
            // Interactive mode: prompt for everything
            templateName = args.name ?? await input({message: 'Template name:'})

            if (!templateName.trim()) {
                this.error('Template name is required')
            }

            this.log('Enter commands (one per line, empty line to finish):')
            commands = []

            while (true) {
                const cmd = await input({message: '>'})
                if (cmd.trim() === '') {
                    break
                }

                commands.push(cmd)
            }

            if (commands.length === 0) {
                this.error('At least one command is required')
            }

            if (!description) {
                description = await input({message: 'Description (optional):'})
            }
        } else {
            // Non-interactive mode: parse args
            if (!args.name) {
                this.error('Template name is required. Use --interactive for interactive mode.')
            }

            templateName = args.name

            // Get commands from remaining arguments (argv includes all args including the name)
            const allArgs = argv as string[]
            commands = allArgs.slice(1) // Skip the template name

            if (commands.length === 0) {
                this.error('At least one command is required')
            }
        }

        // Check if the template already exists
        if (templateExists(templateName)) {
            const overwrite = await confirm({
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