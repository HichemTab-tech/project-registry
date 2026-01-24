import {Args} from "@oclif/core";
import {execSync} from "node:child_process";

import {BaseCommand} from "../BaseCommand.js";

class SelfUpdate extends BaseCommand {
    static args = {
        packageManager: Args.string({
            description: 'Package manager to use for update (npm, yarn, pnpm)',
            required: false
        }),
    }

    static description = 'Self update the projx CLI'

    static examples = ['<%= config.bin %> <%= command.id %>']

    // Visible for testing
    exec(command: string): Buffer {
        return execSync(command)
    }

    async run(): Promise<void> {
        const {args} = await this.parse(SelfUpdate)

        const packageManager = args.packageManager ?? 'pnpm'

        this.log(`Updating from: ${this.config.pjson.version}`)

        let command: string|undefined;
        switch (packageManager) {
            case 'npm': {
                command = 'npm install -g project-registry@latest';
                break;
            }

            case 'pnpm': {
                command = 'pnpm add project-registry@latest -g';
                break;
            }

            case 'yarn': {
                command = 'yarn global add project-registry@latest';
                break;
            }
        }

        if (!command) {
            this.error(`Unsupported package manager: ${packageManager}`);
        }

        try {
            const stdout = this.exec(command);

            this.log(stdout.toString());
        } catch (error) {
            if (error instanceof Error) {
                this.error(`Failed to update project-registry: ${error.message}`);
            }

            this.error(`Failed to update project-registry.`)
        }

        this.log('Update complete. Please restart your terminal session if necessary.')
    }
}

// noinspection JSUnusedGlobalSymbols
export default SelfUpdate