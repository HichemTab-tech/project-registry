const VARIABLE_PATTERN = /\{\{([\s\S]*?)}}/g

export function extractVariables(commands: string[]): Map<string, { description: string; replacements: string[] }> {
    const variables = new Map<string, { description: string; replacements: string[] }>()
    for (const command of commands) {
        let match: null | RegExpExecArray
        const regex = new RegExp(VARIABLE_PATTERN.source, 'g')
        while ((match = regex.exec(command)) !== null) {
            const text = match[1];
            const parts = text.split('::');
            if (text.includes('::')) {
                if (parts.length > 0) {
                    const name = parts[0].trim();
                    const description = parts[1]?.trim() ?? "";
                    // eslint-disable-next-line max-depth
                    if (variables.has(name)) {
                        variables.get(name)!.replacements.push(text)
                        // eslint-disable-next-line max-depth
                        if (description) variables.get(name)!.description = description
                    } else {
                        variables.set(name, {description, replacements: [text]})
                    }
                }
            } else if (variables.has(text)) {
                variables.get(text)!.replacements.push(text)
            } else {
                variables.set(text, {description: '', replacements: [text]})
            }
        }
    }

    return variables
}

export function replaceVariables(command: string, values: Record<string, {
    replacements: string[],
    result: string
}>): string {
    for (const value of Object.values(values)) {
        for (const replacement of value.replacements) {
            command = command.replace(`{{${replacement}}}`, value.result)
        }
    }

    return command;
}

export function replaceAllVariables(commands: string[], values: Record<string, {
    replacements: string[],
    result: string
}>): string[] {
    return commands.map((cmd) => replaceVariables(cmd, values))
}
