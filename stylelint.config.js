export default {
  extends: ['stylelint-config-standard', 'stylelint-config-clean-order'],
  rules: {
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'no-empty-source': [true, { severity: 'warning' }],
  },
};
