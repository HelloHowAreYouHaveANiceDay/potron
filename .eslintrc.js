module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: 'airbnb-base',
  globals: {
    __static: true
  },
  plugins: [
    'html'
  ],
  'rules': {
    'global-require': 0,
    'import/no-unresolved': 0,
    'no-param-reassign': 0,
    'no-shadow': 0,
    'import/extensions': 0,
    'import/newline-after-import': 0,
    'no-multi-assign': 0,
    'no-restricted-syntax': 0,
    'no-tabs': 0,
    'no-plusplus': 0,
    'consistent-return': 0,
    'no-mixed-operators': 0,
    'no-underscore-dangle': 0,
    'no-bitwise': 0,
    'no-useless-concat': 0,
    'max-len': 0,
    'no-lone-blocks': 0,
    'no-continue': 0,
    'radix': 0,
    'linbreak-style': 0,
    'camelcase': 0,
    'class-methods-use-this': 0,
    'import/no-named-as-default-member': 0,
    'no-dupe-class-members': 0,
    'no-case-declarations': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
