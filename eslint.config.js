import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: false,
  vue: false,
  javascript: {
    overrides: {
      'no-console': 'off',
    },
  },
  rules: {
    'no-console': 'off',
    'no-undef': 'off',
    'no-use-before-define': 'off',
  },
})
