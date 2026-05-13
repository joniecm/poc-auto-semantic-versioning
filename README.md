# POC: Auto Semantic Versioning Playground

This repository is a tiny app prepared for testing CI-driven version resolution and container publishing to GitHub Container Registry (GHCR).

## What is included

- Minimal Node.js app (`src/index.js`)
- GitHub Actions workflows for push CI and manual release publish
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
2. Open **Actions** and run workflow **Publish Release Tag and Image** manually on that release branch.
3. The `create-release-tag` job extracts `x.y.z` from the branch and automatically creates/pushes `vx.y.z`.
4. In the same manual run, the job builds and pushes container image `ghcr.io/<owner>/poc-auto-semantic-versioning:vx.y.z`.

This guarantees the final release tag and release image are published together.

## Release branch protection

Pushes to `release/x.y.z` are guarded by a control job:

1. The pipeline checks whether final tag `vx.y.z` already exists in the remote repository.
2. If that tag exists, the workflow fails immediately and build/push is stopped.

This prevents any further release branch pipeline runs from publishing artifacts for a version that has already been finalized.

## CI pipeline

The workflow:

1. On push events, validates release branches are not already finalized by an existing `vx.y.z` tag.
2. Computes the version based on the event type and branch/tag.
3. Builds a container image.
4. Pushes the image to `ghcr.io/<owner>/poc-auto-semantic-versioning:<version>`.
5. On `main` branch builds, also pushes a moving alias tag: `ghcr.io/<owner>/poc-auto-semantic-versioning:main`.
6. Separate manual workflow **Publish Release Tag and Image** runs from `release/x.y.z`, creates/pushes `vx.y.z`, and publishes the same versioned image.

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
# create-release-tag job pushes v0.1.0 and image ghcr.io/<owner>/poc-auto-semantic-versioning:v0.1.0
# any later push to release/0.1.0 is blocked by guard because v0.1.0 already exists
```

Manual release publish:

```bash
# run workflow "Publish Release Tag and Image" manually on release/0.1.1 branch
# create-release-tag creates and pushes v0.1.1
# create-release-tag publishes ghcr.io/<owner>/poc-auto-semantic-versioning:v0.1.1
```
