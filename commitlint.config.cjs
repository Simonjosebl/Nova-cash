/**
 * Commits convencionales (Cap. 7.9 / ADR-028).
 * feat · fix · refactor · style · docs · test · perf · build · ci · chore · revert
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'style',
        'docs',
        'test',
        'perf',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
  },
};
