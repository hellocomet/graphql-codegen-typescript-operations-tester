module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  overrides: [
    {
      files: ['*.js'],
      extends: ['eslint:recommended', 'prettier'],
    },
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
      settings: {
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      plugins: ['import'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',

        // prettier config will turn rules off according to prettier, it should always be at the end
        'prettier',
      ],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
      },
    },
  ],
}
