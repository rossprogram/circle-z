module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-tabs': 0,
    'indent': 0,
    'no-trailing-spaces': 0,
    "no-param-reassign": 0,
    'import/no-extraneous-dependencies': 0,
    'spaced-comment': 0,
    'padded-blocks': 0,        
    'no-mixed-spaces-and-tabs': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
