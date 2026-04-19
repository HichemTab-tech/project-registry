import {Hook} from '@oclif/core'

import {actionExists, getAction} from '../utils/config.js'
import {runAction} from '../utils/runner.js'

const hook: Hook<'command_not_found'> = async function (opts) {
    const {id} = opts

    // The id is the command that was not found
    // oclif joins command parts with ':', e.g., "react:my-app" for "xcute react my-app"
    // We need to extract the action name (first part)
    if (!id) {
        return
    }

    const parts = id.split(':')
    const actionName = parts[0]

    if (!actionExists(actionName)) {
        return
    }

    const action = getAction(actionName)

    if (!action) {
        return
    }

    // Get additional args from process.argv (skip node, script, action name)
    const providedValues = process.argv.slice(3)

    // Check for --interactive flag
    const interactiveIndex = providedValues.indexOf('--interactive')
    const shortInteractiveIndex = providedValues.indexOf('-i')
    const interactive = interactiveIndex !== -1 || shortInteractiveIndex !== -1

    // Remove the interactive flag from values
    const cleanedValues = providedValues.filter((v) => v !== '--interactive' && v !== '-i')

    const success = await runAction(action, {
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
