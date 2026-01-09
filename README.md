project-registry
=================

A developer CLI that starts projects from named templates backed by shell commands.


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/project-registry.svg)](https://npmjs.org/package/project-registry)
[![Downloads/week](https://img.shields.io/npm/dw/project-registry.svg)](https://npmjs.org/package/project-registry)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g project-registry
$ projx COMMAND
running command...
$ projx (--version)
project-registry/0.0.0 win32-x64 node-v24.8.0
$ projx --help [COMMAND]
USAGE
  $ projx COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`projx hello PERSON`](#projx-hello-person)
* [`projx hello world`](#projx-hello-world)
* [`projx help [COMMAND]`](#projx-help-command)
* [`projx plugins`](#projx-plugins)
* [`projx plugins add PLUGIN`](#projx-plugins-add-plugin)
* [`projx plugins:inspect PLUGIN...`](#projx-pluginsinspect-plugin)
* [`projx plugins install PLUGIN`](#projx-plugins-install-plugin)
* [`projx plugins link PATH`](#projx-plugins-link-path)
* [`projx plugins remove [PLUGIN]`](#projx-plugins-remove-plugin)
* [`projx plugins reset`](#projx-plugins-reset)
* [`projx plugins uninstall [PLUGIN]`](#projx-plugins-uninstall-plugin)
* [`projx plugins unlink [PLUGIN]`](#projx-plugins-unlink-plugin)
* [`projx plugins update`](#projx-plugins-update)

## `projx hello PERSON`

Say hello

```
USAGE
  $ projx hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ projx hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/HichemTab-tech/project-registry/blob/v0.0.0/src/commands/hello/index.ts)_

## `projx hello world`

Say hello world

```
USAGE
  $ projx hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ projx hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/HichemTab-tech/project-registry/blob/v0.0.0/src/commands/hello/world.ts)_

## `projx help [COMMAND]`

Display help for projx.

```
USAGE
  $ projx help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for projx.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.36/src/commands/help.ts)_

## `projx plugins`

List installed plugins.

```
USAGE
  $ projx plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ projx plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/index.ts)_

## `projx plugins add PLUGIN`

Installs a plugin into projx.

```
USAGE
  $ projx plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into projx.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the PROJX_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the PROJX_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ projx plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ projx plugins add myplugin

  Install a plugin from a github url.

    $ projx plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ projx plugins add someuser/someplugin
```

## `projx plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ projx plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ projx plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/inspect.ts)_

## `projx plugins install PLUGIN`

Installs a plugin into projx.

```
USAGE
  $ projx plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into projx.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the PROJX_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the PROJX_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ projx plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ projx plugins install myplugin

  Install a plugin from a github url.

    $ projx plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ projx plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/install.ts)_

## `projx plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ projx plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ projx plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/link.ts)_

## `projx plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ projx plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ projx plugins unlink
  $ projx plugins remove

EXAMPLES
  $ projx plugins remove myplugin
```

## `projx plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ projx plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/reset.ts)_

## `projx plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ projx plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ projx plugins unlink
  $ projx plugins remove

EXAMPLES
  $ projx plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/uninstall.ts)_

## `projx plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ projx plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ projx plugins unlink
  $ projx plugins remove

EXAMPLES
  $ projx plugins unlink myplugin
```

## `projx plugins update`

Update installed plugins.

```
USAGE
  $ projx plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/update.ts)_
<!-- commandsstop -->
