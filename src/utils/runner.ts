import chalk from "chalk";
import {execa, execaCommand, ExecaError} from 'execa'

import {Action} from './config.js'
import {prompts} from "./prompts.js";
import {extractVariables, replaceAllVariables, VariableDefinition} from './variables.js'

export interface RunOptions {
    interactive?: boolean
    log: (message: string) => void
    logError: (message: string) => void
    providedValues?: string[]
}

export interface ShellExecutionPlan {
    args?: string[]
    command: string
    shell?: true
}

export interface VariableResolutionPlan {
    promptDefault?: string
    shouldPrompt: boolean
    value?: string
}

export function createShellExecutionPlan(command: string, platform = process.platform, userShell = process.env.SHELL): ShellExecutionPlan {
    if (platform === 'win32') {
        return {command, shell: true}
    }

    const resolvedShell = userShell?.trim()

    if (!resolvedShell) {
        return {command, shell: true}
    }

    return {
        args: ['-i', '-c', command],
        command: resolvedShell,
    }
}

export function resolveVariableValue(variable: VariableDefinition, providedValue: string | undefined, interactive: boolean): VariableResolutionPlan {
    if (!interactive && providedValue !== undefined) {
        return {
            shouldPrompt: false,
            value: providedValue,
        }
    }

    if (!interactive && variable.defaultValue !== undefined) {
        return {
            shouldPrompt: false,
            value: variable.defaultValue,
        }
    }

    return {
        promptDefault: providedValue ?? variable.defaultValue,
        shouldPrompt: true,
    }
}

export async function runAction(action: Action, options: RunOptions): Promise<boolean> {
    const {interactive = false, log, logError, providedValues = []} = options

    // Extract variables from commands
    const variables = extractVariables(action.commands)

    // Build values map
    const values: Record<string, {
        replacements: string[],
        result: string
    }> = {}

    let i = 0;
    for (const [key, variable] of variables.entries()) {
        const resolutionPlan = resolveVariableValue(variable, providedValues[i], interactive)

        values[key] = resolutionPlan.shouldPrompt ? {
                replacements: variable.replacements,
                result: await prompts.input({
                    default: resolutionPlan.promptDefault || undefined,
                    message: `${key}:${variable.description ? ` ${chalk.grey(`(${variable.description})`)}` : ""}`,
                })
            } : {
                replacements: variable.replacements,
                result: resolutionPlan.value ?? ''
            };

        i++;
    }

    // Replace variables in all commands
    const resolvedCommands = replaceAllVariables(action.commands, values)

    const combinedCommand = resolvedCommands.join(' && ')
    log(`$ ${combinedCommand}`)


    try {
        const executionPlan = createShellExecutionPlan(combinedCommand)

        await (executionPlan.args ? execa(executionPlan.command, executionPlan.args, {
                stdio: 'inherit',
            }) : execaCommand(executionPlan.command, {
                shell: executionPlan.shell ?? true,
                stdio: 'inherit',
            }));
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
