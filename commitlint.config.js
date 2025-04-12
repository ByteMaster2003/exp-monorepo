const settings = {};

const messages = {
  skip: ":skip",
  max: "upper %d chars",
  min: "%d chars at least",
  emptyWarning: "can not be empty",
  upperLimitWarning: "over limit",
  lowerLimitWarning: "below limit"
};

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "perf",
        "ci",
        "build",
        "revert",
        "todo"
      ]
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],

    // Scope
    "scope-case": [2, "always", "lower-case"],
    "scope-empty": [0],
    "scope-max-length": [2, "always", 20],

    // Subject
    "subject-case": [0],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-min-length": [2, "always", 3],
    "subject-max-length": [2, "always", 100],

    // Body
    "body-leading-blank": [2, "always"],
    "body-max-line-length": [2, "always", 100],

    // Footer
    "footer-leading-blank": [2, "always"],
    "footer-max-line-length": [2, "always", 100],

    // References to issues/PRs
    "references-empty": [0]
  },
  helpUrl: "https://github.com/conventional-changelog/commitlint/#what-is-commitlint",
  prompt: {
    settings,
    messages
  }
};
