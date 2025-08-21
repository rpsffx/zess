import { sxzz } from '@sxzz/eslint-config'

export default sxzz({
  rules: {
    eqeqeq: 'off',
    'import/no-default-export': 'off',
    'unicorn/no-for-loop': 'off',
    'unicorn/no-new-array': 'off',
    'unicorn/new-for-builtins': 'off',
    'unicorn/prefer-modern-dom-apis': 'off',
    'unicorn/prefer-dom-node-remove': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
  },
})
