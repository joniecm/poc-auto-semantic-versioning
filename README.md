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
   - `main` -> `v<latest-stable>-<shortSha>` (example: `v0.1.0-a1b2c3d`)
   - `release/x.y.z` -> `vx.y.z-rcN` (example: `v0.1.0-rc1`)

Notes:

- `N` for `rc` is the number of commits ahead of `main` for that branch.
- `release/*` branches must use a valid semantic version in the branch name.

## Release tag automation

When you push commits to a `release/*` branch, an automated job will:

1. Extract the version from the branch name (for example, `release/0.1.0` → `v0.1.0`).
2. Create a Git tag with that version.
3. Push the tag to the repository.

This triggers the container build job with the exact tag version, so `v0.1.0` becomes the image tag.
If the tag already exists, the job skips tag creation gracefully.

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
# automated job creates and pushes tag v0.1.0
```

Manual tag build:

```bash
git tag v0.1.1
git push origin v0.1.1
# build version is exactly v0.1.1
```
