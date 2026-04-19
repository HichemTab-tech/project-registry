# Why project-registry was renamed to xcute-cli

> For more info about migration guide, check the [MIGRATION.md](MIGRATION.md) document.

## Initial idea

When this project started, it was designed to solve a very specific problem:

> Store and reuse **project starter templates**

Typical use cases were:
- creating a React app
- bootstrapping a Laravel project
- cloning starter repositories

At that stage, the name **project-registry** made sense:
it was essentially a registry of reusable project setups.

## How usage evolved

Over time, the tool started being used differently.

Instead of just project templates, it became:

- a way to store **any command**
- a way to run **multi-step workflows**
- a personal CLI toolbox for daily tasks

Examples:

```json
"react-shadcn": {
  "commands": [
    "mkdir {{name}}",
    "git clone https://github.com/HichemTab-tech/vite-shadcn-template {{name}}",
    "cd {{name}}",
    "pnpm install",
    "pnpm run dev"
  ]
}
````

```json
"doc-exe": {
  "commands": [
    "docker exec -it {{containerName}} /bin/bash"
  ]
}
```

Real usage expanded to:

* Docker commands
* VPS workflows
* repetitive dev tasks
* quick environment setup
* importing setups from remote sources (e.g. gists)

At this point, the tool was no longer about "projects".

## The mismatch

The name **project-registry** became misleading:

* too specific (projects only)
* not aligned with real usage
* generic and hard to associate with the tool

This created friction:

* when explaining the tool
* when using it daily
* when thinking about its future direction

## The new direction

The tool is now clearly:

> A CLI to execute reusable command workflows

So the name needed to reflect that.

## Why "xcute"

The new name **xcute** comes from:

> **execute**

It represents what the tool actually does:

* execute commands
* execute workflows
* execute reusable setups

## Migration philosophy

The rename follows common npm practices:

* publish a new package under a better name
* deprecate the old package with a clear message
* guide users to migrate

This approach is recommended because npm does not support direct renaming of packages. ([Stack Overflow][1])

Instead, deprecation is used to inform users and redirect them to the new package. ([npm Docs][2])

## Final note

The core idea has not changed:

> Save commands. Reuse them. Execute instantly.

Only the name has been updated to better reflect reality.

[1]: https://stackoverflow.com/questions/28371669/renaming-a-published-npm-module "Renaming a published NPM module"
[2]: https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions "Deprecating and undeprecating packages or ..."
