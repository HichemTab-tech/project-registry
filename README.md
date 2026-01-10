# projx

A CLI tool to save and run command templates with variables.

[![Version](https://img.shields.io/npm/v/project-registry.svg)](https://npmjs.org/package/project-registry)
[![Downloads/week](https://img.shields.io/npm/dw/project-registry.svg)](https://npmjs.org/package/project-registry)
[![License](https://img.shields.io/npm/l/project-registry.svg)](https://github.com/HichemTab-tech/project-registry/blob/master/LICENSE)

## Installation

```bash
npm install -g project-registry
```

## Quick Start

```bash
# Add a template
projx add react "pnpm create vite {{name}} --template react" "cd {{name}}" "pnpm install"

# Run it
projx react my-app

# Or use the run command
projx run react my-app
```

## Commands

### `projx add <name> <commands...>`

Register a new template with one or more commands.

```bash
# Basic usage
projx add <name> "command1" "command2" "command3"

# With description
projx add <name> -d "My template description" "command1" "command2"

# Interactive mode
projx add -i
```

**Variables:** Use `{{variable}}` syntax in your commands. Variables are prompted or passed as arguments when running.

### `projx run <name> [values...]`

Run a registered template.

```bash
# Pass variable values as arguments
projx run react my-app

# Interactive mode - prompts for all variables
projx run react -i
```

### `projx <name> [values...]`

Shortcut - run any template directly without the `run` command.

```bash
projx react my-app
```

### `projx list`

List all registered templates.

```bash
# Table format (default)
projx list

# With commands shown
projx list -c

# Plain format
projx list --no-table
```

### `projx select`

Interactively select and run a template.

```bash
projx select
```

### `projx remove <name>`

Remove a registered template.

```bash
# By name
projx remove react

# Interactive selection
projx remove -s
```

## Examples

### Project Templates

```bash
# React + Vite
projx add react "pnpm create vite {{name}} --template react-ts" "cd {{name}}" "pnpm install" "code ."

# Next.js
projx add next "pnpm create next-app {{name}}" "cd {{name}}" "code ."

# Express API
projx add express "mkdir {{name}}" "cd {{name}}" "pnpm init -y" "pnpm add express" "code ."
```

### Dev Shortcuts

```bash
# Git quick commit
projx add gc "git add ." "git commit -m '{{message}}'" "git push"

# Docker compose
projx add dcu "docker compose up -d"
projx add dcd "docker compose down"

# SSH to server
projx add ssh-prod "ssh {{user}}@production-server.com"
```

### Build & Deploy

```bash
# Build and deploy
projx add deploy "pnpm build" "pnpm deploy"

# Run tests
projx add t "pnpm test"
projx add tw "pnpm test --watch"
```

## Not Just for Projects

While `projx` is great for project scaffolding, it works for **any repeatable command sequence**:

- **Git workflows** - commit, push, branch creation
- **Docker operations** - build, run, compose commands
- **SSH connections** - quick access to servers
- **Build scripts** - compile, test, deploy pipelines
- **System shortcuts** - any command you run often

Think of it as a **command template manager** - save any sequence of commands once, run them anytime with dynamic variables.

## Config Location

Templates are stored in `~/.project-registry/config.json`

## License

MIT
