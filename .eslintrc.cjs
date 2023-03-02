module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  overrides: [
    {
      env: {
        jest: true
      },
      files: [
        'test/**/*.spec.{j,t}s?(x)'
      ]
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'sort-imports-es6-autofix',
    'sort-keys-fix'
  ],
  // http://eslint.cn/docs/rules/
  rules: {
    // 禁用行尾空格,
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/naming-convention': [
      'off',
      {
        format: null,
        selector: 'default'
      }
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'arrow-spacing': ['error', { 'after': true, 'before': true }],
    'comma-dangle': ['error', 'never'],
    'comma-spacing': 'error',
    'eol-last': 'error',
    // 使用2个空格
    indent: ['error', 2, { SwitchCase: 1 }],
    'key-spacing': 'error',
    // } else if() {
    'keyword-spacing': ['error', { before: true }],
    'no-console': 'off',
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-empty': 'off',
    'no-trailing-spaces': 'error',
    'no-unused-vars': 'off',
    'object-curly-spacing': [
      2,
      'always',
      { arraysInObjects: true, objectsInObjects: false }
    ],
    // 使用单引号
    quotes: ['error', 'single'],
    semi: 'error',
    'sort-imports-es6-autofix/sort-imports-es6': ['warn', {
      'ignoreCase': false,
      'ignoreMemberSort': false,
      'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single']
    }],
    'sort-keys-fix/sort-keys-fix': 'warn',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', 'always'],
    'space-infix-ops': ['error', { 'int32Hint': false }]
  }
};
