// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module',
    parser: 'babel-eslint',
    ecmaVersion: 2017
  },
  env: {
    browser: true
  },
  extends: ['airbnb-base', 'prettier', 'plugin:vue/recommended'],
  // check if imports actually resolve
  settings: {
    'import/resolver': {
      webpack: {
        config: 'vuewebpack.config.js'
      }
    }
  },
  // add your custom rules here
  rules: {
    // don't require .vue extension when importing
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        vue: 'never'
      }
    ],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': [
      'error',
      {
        optionalDependencies: ['test/unit/index.js']
      }
    ],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'linebreak-style': ['error', 'windows'],
    // indent: 'off',
    'vue/script-indent': 'off',
    'no-param-reassign': 0
  }
};
