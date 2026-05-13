# POC: Auto Semantic Versioning Playground

This repository is a tiny app prepared for testing CI-driven version resolution and container publishing to GitHub Container Registry (GHCR).

## What is included

- Minimal Node.js app (`src/index.js`)
- GitHub Actions workflow for auto versioning + container build/push
- Branch conventions for version formats (`main`, `release/*`)

## Versioning policy (resolved in CI)

Version precedence:

1. If a Git tag build is triggered (`v*`), use the exact tag as the image version.
2. Otherwise resolve by branch rule:
   - `main` -> `main.<yyyymmdd>.<runNumber>` (example: `main.20260512.3`)
   - `release/x.y.z` -> `vx.y.z-rcN` (example: `v0.1.0-rc1`)

Notes:

- `N` for `rc` is the number of commits ahead of `main` for that branch.
- `release/*` branches must use a valid semantic version in the branch name.

## Release tag creation

Tags for final releases are created by a manual GitHub Actions job.

1. Create or update your `release/x.y.z` branch.
2. Open **Actions** and run this workflow manually on that release branch.
3. The `create-release-tag` job extracts `x.y.z` from the branch and automatically creates/pushes `vx.y.z`.

Pushing the tag triggers the container build job with the exact tag version, so `vx.y.z` becomes the image tag.

## CI pipeline

The workflow:

1. Computes the version based on the event type and branch/tag.
2. Builds a container image.
3. Pushes the image to `ghcr.io/<owner>/poc-auto-semantic-versioning:<version>`.
4. On `main` branch builds, also pushes a moving alias tag: `ghcr.io/<owner>/poc-auto-semantic-versioning:main`.

Required GitHub permissions:

- `contents: read`
- `packages: write`

## Quick test flows

Release candidate branch:

```bash
git checkout main
git checkout -b release/0.1.0
# first commit on branch -> image tagged v0.1.0-rc1
# when ready, manually run the workflow on release/0.1.0
# create-release-tag job pushes v0.1.0
```

Manual tag build:

```bash
# run the workflow manually on release/0.1.1 branch
# create-release-tag creates and pushes v0.1.1
```
