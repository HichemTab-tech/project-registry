import {Command} from '@oclif/core'
import path from "node:path";
import {fileURLToPath} from "node:url";

import {setConfigDir} from "./utils/config.js";

export abstract class BaseCommand extends Command {
    constructor(...args: ConstructorParameters<typeof Command>) {
        super(...args);
        if (process.env.NODE_ENV === 'development') {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            // Option A - simple: resolve relative to this source file
            const devPath = path.resolve(__dirname, "../test-config-dir");
            setConfigDir(devPath);
            this.debug("Setting config dir to", devPath);

        }
    }
}