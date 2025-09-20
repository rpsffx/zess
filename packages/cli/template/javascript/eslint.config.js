import { sxzz } from '@sxzz/eslint-config'
import react from 'eslint-plugin-react'

export default sxzz().append({
  plugins: { react },
  rules: {
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
  },
})
