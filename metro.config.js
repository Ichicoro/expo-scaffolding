const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Local Expo modules under modules/ are autolinked natively, but Metro still
// resolves JS by path — alias the bare specifier so app code can import it the
// same way it imports any other Expo module.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'expo-system-accent': path.resolve(__dirname, 'modules/expo-system-accent'),
};
config.watchFolders = [...(config.watchFolders ?? []), path.resolve(__dirname, 'modules')];

module.exports = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: false,
});
