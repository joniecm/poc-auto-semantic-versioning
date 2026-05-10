const { execSync } = require("node:child_process");

function run(command, fallback = "") {
  try {
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
}

function parseSemver(tag) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(tag);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3])
  };
}

function formatSemver(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}

function incPatch(version) {
  return { ...version, patch: version.patch + 1 };
}

function incMinor(version) {
  return { ...version, minor: version.minor + 1, patch: 0 };
}

function getLatestTagVersion() {
  const latestTag = run("git describe --tags --abbrev=0", "");
  const parsed = parseSemver(latestTag);
  return parsed || { major: 0, minor: 1, patch: 0 };
}

function sanitizeBranchName(name) {
  return name.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-");
}

function getDynamicVersion() {
  const branchName = run("git rev-parse --abbrev-ref HEAD", "local");
  const commitCount = run("git rev-list --count HEAD", "0");
  const shortSha = run("git rev-parse --short HEAD", "nogit");
  const base = getLatestTagVersion();

  if (branchName === "main" || branchName === "master") {
    return formatSemver(base);
  }

  if (branchName === "develop") {
    return `${formatSemver(incPatch(base))}-alpha.${commitCount}`;
  }

  if (branchName.startsWith("release/")) {
    const candidate = parseSemver(branchName.split("/")[1]);
    const releaseBase = candidate || incPatch(base);
    return `${formatSemver(releaseBase)}-rc.${commitCount}`;
  }

  if (branchName.startsWith("hotfix/")) {
    return `${formatSemver(incPatch(base))}-hotfix.${commitCount}`;
  }

  if (branchName.startsWith("feature/")) {
    const next = incMinor(base);
    return `${formatSemver(next)}-${sanitizeBranchName(branchName)}.${commitCount}+${shortSha}`;
  }

  return `${formatSemver(incPatch(base))}-${sanitizeBranchName(branchName)}.${commitCount}+${shortSha}`;
}

console.log(getDynamicVersion());
