import { sxzz, type Config } from '@sxzz/eslint-config'
import { globalIgnores } from 'eslint/config'

const configs: Config[] = sxzz([
  globalIgnores(['**/*.{md,mdx}', '**/template']) as Config,
  {
    rules: {
      eqeqeq: 'off',
      'import/no-default-export': 'off',
      'unicorn/no-for-loop': 'off',
      'unicorn/no-new-array': 'off',
      'unicorn/new-for-builtins': 'off',
      'unicorn/prefer-modern-dom-apis': 'off',
      'unicorn/prefer-dom-node-remove': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
    },
  },
])

export default configs
