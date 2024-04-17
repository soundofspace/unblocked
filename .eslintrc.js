const { monorepo } = require('@ulixee/repo-tools/eslint');
module.exports = monorepo(__dirname);
module.exports.ignorePatterns.push('DomExtractor.js');
module.exports.overrides.push({
    files: ['browser-profiler/**/*', 'double-agent-stacks/**/*'],
    rules: { 'no-console': 'off' },
});
//# sourceMappingURL=.eslintrc.js.map