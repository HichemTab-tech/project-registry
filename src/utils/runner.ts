import {execaCommand, ExecaError} from 'execa'

import {Template} from './config.js'
import {prompts} from "./prompts.js";
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
            values[variable] = await prompts.input({
                default: defaultValue || undefined,
                message: `${variable}:`,
            })
        }
    }

    // Replace variables in all commands
    const resolvedCommands = replaceAllVariables(template.commands, values)

    const combinedCommand = resolvedCommands.join(' && ')
    log(`$ ${combinedCommand}`)

    try {
        await execaCommand(combinedCommand, {
            shell: true,
            stdio: 'inherit',
        })
    } catch (error: unknown) {
        if (error && error instanceof ExecaError && typeof error.exitCode === 'number') {
            logError(`Command failed with exit code ${error.exitCode}`)
        } else if (error instanceof Error) {
            logError(`Command failed: ${error.message}`)
        } else {
            logError('Command failed')
        }

        return false
    }

    return true
}
