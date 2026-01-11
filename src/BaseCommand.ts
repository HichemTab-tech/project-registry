import {Command} from '@oclif/core'

import {setDevIfDev} from "./utils/config.js";

export abstract class BaseCommand extends Command {
    constructor(...args: ConstructorParameters<typeof Command>) {
        super(...args);

        setDevIfDev(this.debug);
    }
}