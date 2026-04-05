module.exports = {
  extends: ['@commitlint/config-conventional'],
  // Ignore automated release commits produced by @semantic-release/git.
  // These commits are machine-generated and may contain long URLs in the body.
  ignores: [(commit) => /^chore\(release\):.*\[skip ci\]/.test(commit)],
};
