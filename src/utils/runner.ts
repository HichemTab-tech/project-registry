import {input} from '@inquirer/prompts'
import {execaCommand} from 'execa'

import {Template} from './config.js'
import {extractVariables, replaceAllVariables} from './variables.js'

export interface RunOptions {
    interactive?: boolean
    log: (message: string) => void
    logError: (message: string) => void
    providedValues?: string[]
}

export async function runTemplate(template: Template, options: RunOptions): Promise<boolean> {
    const {interactive = false, log, logError, providedValues = []} = options

    // Extract variables from commands
    const variables = extractVariables(template.commands)

    // Build values map
    const values: Record<string, string> = {}

    for (const [i, variable] of variables.entries()) {

        if (providedValues[i] && !interactive) {
            // Use provided value if available and not in interactive mode
            values[variable] = providedValues[i]
        } else if (interactive || !providedValues[i]) {
            // Prompt for value in interactive mode or if not provided
            const defaultValue = providedValues[i] || ''
            values[variable] = await input({
                default: defaultValue || undefined,
                message: `${variable}:`,
            })
        }
    }

    // Replace variables in all commands
    const resolvedCommands = replaceAllVariables(template.commands, values)

    // Execute commands in order
    for (const command of resolvedCommands) {
        log(`$ ${command}`)

        try {
            const result = await execaCommand(command, {
                shell: true,
                stdio: 'inherit',
            })

            if (result.exitCode !== 0) {
                logError(`Command failed with exit code ${result.exitCode}`)
                return false
            }
        } catch (error) {
            if (error instanceof Error) {
                logError(`Command failed: ${error.message}`)
            } else {
                logError('Command failed')
            }

            return false
        }
    }

    return true
}
