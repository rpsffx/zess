import { sxzz, type Config } from '@sxzz/eslint-config'
import { globalIgnores } from 'eslint/config'

const config: Promise<Config[]> = sxzz()
  .append(globalIgnores(['**/*.{md,mdx}', '**/template']) as Config)
  .removeRules(
    'eqeqeq',
    'import/no-default-export',
    'unicorn/no-for-loop',
    'unicorn/no-new-array',
    'unicorn/new-for-builtins',
    'unicorn/prefer-modern-dom-apis',
    'unicorn/prefer-dom-node-remove',
    '@typescript-eslint/no-this-alias',
    '@typescript-eslint/consistent-type-assertions',
  )

export default config
