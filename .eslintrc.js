module.exports = {
  root: true,
  extends: `@avalanche/eslint-config`,
  parserOptions: {
    ecmaVersion: 8,
  },
  rules: {
    'class-methods-use-this': `off`,
  },
};
