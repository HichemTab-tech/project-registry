import {Command} from '@oclif/core'

import {emitDeprecationNotice} from './utils/deprecation.js'

export abstract class BaseCommand extends Command {
	async init(): Promise<void> {
		await super.init()
		emitDeprecationNotice((message) => this.warn(message))
	}
}