module.exports = {
  root: true,
  env: {
    browser: true
  },
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module',
    extraFileExtensions: ['.mjs'],
  },
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    // 'plugin:import/errors',
    // 'plugin:import/warnings',
    // 'plugin:import/typescript',
  ],
  rules: {
    '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/no-var-requires': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/unbound-method': ['off'],
    '@typescript-eslint/no-unnecessary-condition': ['warn', { allowConstantLoopConditions: true }],
    '@typescript-eslint/restrict-template-expressions': ['warn', {
      allowNumber: true,
      allowBoolean: true,
      allowAny: true,
    }],
    '@typescript-eslint/prefer-for-of': ['warn'],
    '@typescript-eslint/prefer-regexp-exec': ['warn'],
    '@typescript-eslint/prefer-function-type': ['error'],
    '@typescript-eslint/prefer-optional-chain': ['error'],
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': ['error'],

    // consider turning these on in the future to make the code tighter
    '@typescript-eslint/no-unsafe-assignment': ['off'],
    '@typescript-eslint/no-unsafe-call': ['off'],
    '@typescript-eslint/no-unsafe-member-access': ['off'],
    '@typescript-eslint/no-unsafe-return': ['off'],

    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: [
          // Index signature
          'signature',
          // Static
          'private-static-field',
          'protected-static-field',
          'public-static-field',
          'private-static-method',
          'protected-static-method',
          'public-static-method',
          'private-instance-field',
          'protected-instance-field',
          'public-instance-field',
          // Constructors
          'private-constructor',
          'protected-constructor',
          'public-constructor',
          // Methods
          'private-instance-method',
          'protected-instance-method',
          'public-instance-method',
          // Abstract
          'private-abstract-field',
          'protected-abstract-field',
          'public-abstract-field',
          'private-abstract-method',
          'protected-abstract-method',
          'public-abstract-method'
        ]
      }
    ],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit'
      }
    ],
    '@typescript-eslint/prefer-readonly': ['warn'],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-unused-expressions': ['warn'],
    '@typescript-eslint/no-misused-promises': ['warn', { checksVoidReturn: false }],

    'no-continue': 'off',
    'no-restricted-syntax': 'off',
    'space-before-function-paren': 'off',
    'no-use-before-define': 'off',
    'no-unused-vars': 'off', // replaced by typescript-eslint variant
    'no-unused-expressions': 'off', // replaced by typescript-eslint variant
    'func-names': 'off',
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'no-console': 'off',
    'no-underscore-dangle': 'off',

    // semantic rules
    'accessor-pairs': ['error'],
    'grouped-accessor-pairs': ['error', 'getBeforeSet'],
    'yoda': ['error', 'never', { exceptRange: true }],
    'no-unneeded-ternary': ['error'],
    'no-var': ['error'],
    'no-useless-computed-key': ['error'],
    'prefer-const': ['error', { destructuring: 'all' }],
    'constructor-super': ['warn'],

    // spacing rules
    'dot-location': ['warn', 'property'],
    'block-spacing': ['error', 'always'],
    'key-spacing': ['error'],
    'semi-spacing': ['error', { before: false, after: true }],
    'comma-spacing': ['error', { before: false, after: true }],
    '@typescript-eslint/keyword-spacing': ['error', { before: true, after: true }],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'computed-property-spacing': ['error', 'never'],
    'space-in-parens': ['error', 'never'],
    'space-before-blocks': ['error', 'always'],
    'no-whitespace-before-property': ['error'],
    'no-trailing-spaces': ['warn'],
    '@typescript-eslint/func-call-spacing': ['error', 'never'],
    'generator-star-spacing': ['error', 'both'],
    'yield-star-spacing': ['error', 'both'],
    'space-infix-ops': ['error', { "int32Hint": false }],
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        ignoredNodes: [
          'TemplateLiteral'
        ]
      }
    ],

    // newline rules
    'object-curly-newline': ['error', { multiline: true, minProperties: 4, consistent: true }],
    'object-property-newline': ['error'],
    'array-bracket-newline': ['error', { multiline: true, minItems: 4 }],
    'function-call-argument-newline': ['error', 'consistent'],
    'lines-between-class-members': ['error', 'always'],
    'operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],

    // comma rules
    'comma-dangle': [
      'error',
      {
        objects: 'always-multiline',
        arrays: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never'
      }
    ],
    '@typescript-eslint/comma-spacing': ['error', { before: false, after: true }],
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/no-extra-semi': ['error'],

    // braces
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],

    // quote rules
    'quote-props': ['error', 'consistent-as-needed'],
    '@typescript-eslint/quotes': ['error', 'single'],

    // 'import/extensions': ['warn', 'never'],
    // 'import/prefer-default-export': ['off'],
    // 'import/first': ['warn'],
    // 'import/no-duplicates': ['warn'],
    // 'import/order': ['error', { 'newlines-between': 'always' }],
    // 'import/newline-after-import': ['warn'],
    'max-classes-per-file': ['warn', 2]
  }
}
