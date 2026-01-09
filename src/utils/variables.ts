const VARIABLE_PATTERN = /\{\{(\w+)}}/g

export function extractVariables(commands: string[]): string[] {
    const variables = new Set<string>()
    for (const command of commands) {
        let match: null | RegExpExecArray
        const regex = new RegExp(VARIABLE_PATTERN.source, 'g')
        while ((match = regex.exec(command)) !== null) {
            variables.add(match[1])
        }
    }

    // Return in order of first appearance
    const orderedVariables: string[] = []
    for (const command of commands) {
        let match: null | RegExpExecArray
        const regex = new RegExp(VARIABLE_PATTERN.source, 'g')
        while ((match = regex.exec(command)) !== null) {
            if (!orderedVariables.includes(match[1])) {
                orderedVariables.push(match[1])
            }
        }
    }

    return orderedVariables
}

export function replaceVariables(command: string, values: Record<string, string>): string {
    return command.replaceAll(VARIABLE_PATTERN, (_, name: string) => values[name] ?? `{{${name}}}`)
}

export function replaceAllVariables(commands: string[], values: Record<string, string>): string[] {
    return commands.map((cmd) => replaceVariables(cmd, values))
}
