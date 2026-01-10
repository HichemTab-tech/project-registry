# Contributing Guide

Thanks for wanting to contribute 🙌
This project is intentionally simple, and the contribution process reflects that.

## Before contributing

* Check existing issues first:
  [https://github.com/HichemTab-tech/project-registry/issues](https://github.com/HichemTab-tech/project-registry/issues)
* If your idea or bug isn’t listed, open a new issue and explain it briefly.
* If you’re unsure, opening an issue **before coding** is totally fine.

## Code of conduct (short version)
* Be respectful.
* Be constructive.
* No toxic behavior.

That’s it.

Long version here: [https://github.com/HichemTab-tech/project-registry/blob/master/CODE_OF_CONDUCT.md](https://github.com/HichemTab-tech/project-registry/blob/main/CODE_OF_CONDUCT.md)

## Tech stack (important)

This CLI is built using **oclif**.

* Each CLI command lives in its own file under `src/commands`
* Adding a new command usually means adding a new file
* Flags, arguments, and help output are handled by oclif

If you’re not familiar with it, check the official docs:
👉 [https://oclif.io/docs/introduction](https://oclif.io/docs/introduction)

You **don’t need deep oclif knowledge** to contribute — most changes are straightforward.

## Local setup

1. Fork the repository on GitHub.
2. Clone your fork:

    ```bash
    git clone https://github.com/YOUR_USERNAME/project-registry
    cd project-registry
    ```

3. Install dependencies:

```bash
npm install
# or
pnpm install
```

## Making changes

1. Create a branch from `master`:

    ```bash
    git checkout -b feature/my-feature
    # or
    git checkout -b fix/my-bug
    ```

2. Make your changes.

3. If you’re adding a CLI command:

    * Add a new file under `src/commands`
    * Follow existing commands as examples

4. Make sure the CLI still works as expected.

    You can test commands using:
    ```bash
    .\bin\run testCommand
    ```

5. Commit with a clear message:

```bash
git commit -m "feat: add filter option to select command"
```

## Submitting a pull request

1. Push your branch:

    ```bash
    git push origin feature/my-feature
    ```

2. Open a Pull Request on GitHub.
3. In the PR description, explain:

    * What you changed
    * Why it’s useful
    * Any related issue (`Closes #123` if applicable)

## Notes

* Small, focused PRs are preferred.
* Avoid refactoring unrelated code.
* Keep changes aligned with the project philosophy:
  **simple, predictable, no magic**.

Thanks for contributing ❤️
