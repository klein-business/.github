# Contributing

Contributions to klein.business repositories are welcome. This document describes our standards and process.

## Before You Start

- Check existing issues and pull requests to avoid duplicate work.
- For non-trivial changes, open an issue first to discuss the approach.
- Read the repository-specific README for setup instructions.

## Development Standards

### Code Quality

- All code must pass linting before commit. Each repository defines its own linting configuration.
- Write tests for new features, bug fixes, and refactors. Untested code will not be merged.
- Follow the existing code style and conventions of the repository.

### Commits

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): correct behavior
refactor(scope): restructure without changing behavior
docs(scope): update documentation
test(scope): add or update tests
chore(scope): maintenance tasks
```

- Keep commits atomic and focused on a single change.
- Write commit messages that describe *what changed* and *why*.

### Branches

- Branch from `main`.
- Use descriptive names: `feat/short-description`, `fix/short-description`, `chore/short-description`.
- Keep branches short-lived. Target merge within 24 hours.

## Pull Request Process

1. Ensure CI passes (linting, tests, build).
2. Fill out the PR template completely.
3. Request review from a maintainer.
4. Address review feedback with new commits (do not force-push during review).
5. PRs are merged via squash-and-merge.

## What We Look For in Reviews

- Correctness: Does the code do what it claims?
- Tests: Are edge cases and error paths covered?
- Clarity: Is the code readable without excessive comments?
- Scope: Does the PR do one thing well, or is it overloaded?

## Getting Help

Open an issue or reach out at **contact@klein.business**.
