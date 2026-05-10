# POC: Auto Semantic Versioning Playground

This repository is a tiny app prepared for testing dynamic versioning across multiple Git branches.

## What is included

- Minimal Node.js app (`src/index.js`)
- Dynamic version resolver (`scripts/dynamic-version.js`)
- Branches commonly used in release workflows (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`)

## Dynamic version rules

The script uses the latest Git tag (`vX.Y.Z`) as the base and derives output by branch type:

- `main` -> `X.Y.Z`
- `develop` -> `X.Y.(Z+1)-alpha.<commitCount>`
- `release/x.y.z` -> `x.y.z-rc.<commitCount>`
- `feature/*` -> `X.(Y+1).0-feature-...<commitCount>+<sha>`
- `hotfix/*` -> `X.Y.(Z+1)-hotfix.<commitCount>`

## Quick start

1. Install dependencies (none required for runtime, Node.js 18+ is enough).
2. Run:

```bash
npm run version:dynamic
```

## Suggested branch workflow for tests

```bash
git checkout main
git tag v0.1.0
git checkout develop
# add commits, check alpha versions

git checkout -b feature/login-flow
# add commits, check feature prerelease

git checkout develop
git checkout -b release/0.2.0
# add commits, check rc versions

git checkout main
git checkout -b hotfix/fix-crash
# add commits, check hotfix prerelease
```
