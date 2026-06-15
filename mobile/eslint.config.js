// Configuracao do ESLint para o app Expo.
// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/', 'node_modules/', '.expo/'],
  },
];
