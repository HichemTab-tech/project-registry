# Migration Guide: project-registry → xcute

This guide explains how to migrate from **project-registry** to **xcute**.

> For more info about why the rename happened, check the [WHY.md](WHY.md) document.

## Overview

The package has been renamed:

- Old: `project-registry`
- New: `xcute`

The functionality remains the same, but the name now better reflects the tool’s purpose.

## 1. Install the new package

```bash
npm uninstall -g project-registry
npm install -g xcute
```

or

```bash
pnpm remove -g project-registry
pnpm add -g xcute
```

## 2. Migrate your existing configuration

If you were using `project-registry`, your data (commands, templates, etc.) is stored locally.

To migrate it automatically, run:

```bash
xcute migrate-from-projx
```

This will:

* locate your existing configuration
* rename/update internal structures if needed
* move everything to the new xcute format

## 3. Update your CLI usage

Replace old commands:

```bash
projx <command>
```

with:

```bash
xcute <command>
```

Same if you have an alias to projx in your shell configuration:

```bash
alias projx='xcute'
```

## 5. Remote imports (no change)

If you were using remote configs:

```bash
projx import <url>
```

You can continue with:

```bash
xcute import <url>
```

No changes required.

## 6. Deprecated package notice

The old package is now deprecated.

When installing it, npm will show a warning message guiding you to `xcute`. ([npm Docs][2])

It will not receive new updates.

## Final note

Migration is designed to be simple:

> Install → run migrate → continue working

If something breaks, you can always reinstall and re-import your configuration.

---

Thanks for using the project 🙌

[1]: https://stackoverflow.com/questions/28371669/renaming-a-published-npm-module "Renaming a published NPM module"
[2]: https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions "Deprecating and undeprecating packages or ..."
