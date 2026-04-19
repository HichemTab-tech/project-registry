export const deprecationMessage = 'project-registry/projx is deprecated and has been renamed to "xcute-cli". Migration guide: https://github.com/HichemTab-tech/xcute/blob/0.6.0/MIGRATION.md Why: https://github.com/HichemTab-tech/xcute/blob/0.6.0/WHY.md'

export function emitDeprecationNotice(log: (message: string) => void): void {
    log(deprecationMessage)
}