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

    const dryRunIndex = providedValues.indexOf('--dry-run')
    const shortDryRunIndex = providedValues.indexOf('-d')
    const dryRun = dryRunIndex !== -1 || shortDryRunIndex !== -1

    // Remove control flags before passing variable values through
    const cleanedValues = providedValues.filter((v) => v !== '--interactive' && v !== '-i' && v !== '--dry-run' && v !== '-d')

    const success = await runAction(action, {
        dryRun,
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
