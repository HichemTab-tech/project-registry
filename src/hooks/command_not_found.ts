import {Hook} from '@oclif/core'

import {getTemplate, setDevIfDev, templateExists} from '../utils/config.js'
import {runTemplate} from '../utils/runner.js'

const hook: Hook<'command_not_found'> = async function (opts) {
    const {id} = opts

    // The id is the command that was not found
    // oclif joins command parts with ':', e.g., "react:my-app" for "projx react my-app"
    // We need to extract the template name (first part)
    if (!id) {
        return
    }

    setDevIfDev(this.debug);

    const parts = id.split(':')
    const templateName = parts[0]

    if (!templateExists(templateName)) {
        return
    }

    const template = getTemplate(templateName)

    if (!template) {
        return
    }

    // Get additional args from process.argv (skip node, script, template name)
    const providedValues = process.argv.slice(3)

    // Check for --interactive flag
    const interactiveIndex = providedValues.indexOf('--interactive')
    const shortInteractiveIndex = providedValues.indexOf('-i')
    const interactive = interactiveIndex !== -1 || shortInteractiveIndex !== -1

    // Remove the interactive flag from values
    const cleanedValues = providedValues.filter((v) => v !== '--interactive' && v !== '-i')

    const success = await runTemplate(template, {
        interactive,
        log: (msg) => console.log(msg),
        logError: (msg) => console.error(msg),
        providedValues: cleanedValues,
    })

    if (!success) {
        process.exit(1)
    }

    process.exit(0)
}

// noinspection JSUnusedGlobalSymbols
export default hook
