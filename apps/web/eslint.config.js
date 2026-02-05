import tseslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { parser },
    plugins: { '@typescript-eslint': tseslint },
    rules: { 'no-unused-vars': 'off' },
  },
]
