module.exports = {
  parser: 'babel-eslint',
  extends: 'airbnb-base',
  rules: {
    'space-before-function-paren': ['error', 'always'],
    'max-len': ['error', 140, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    'no-console': ['warn', {
      allow: ['warn', 'error'],
    }]
  }
};
