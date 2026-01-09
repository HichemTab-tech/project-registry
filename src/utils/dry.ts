import {Command} from "@oclif/core";

import {getAllTemplates} from "./config.js";

export function buildChoices (this: Command) {
    const templates = getAllTemplates()
    const names = Object.keys(templates)

    if (names.length === 0) {
        this.log('No templates registered')
        return
    }

    // Build choices for the select prompt
    return {
        choices: names.map((name, index) => {
            const template = templates[name]
            const description = template.description ? ` - ${template.description}` : ''
            return {
                name: `${index + 1}. ${name}${description}`,
                value: name,
            }
        }),
        templates
    };
}

export const truncate = (s: string | undefined, n = 100) => {
    if (!s) return ''
    return s.length > n ? s.slice(0, n) + '...' : s
}