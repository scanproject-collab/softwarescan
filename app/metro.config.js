const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ['js', 'json', 'ts', 'tsx'];
config.resolver.extraNodeModules = {
  '@components': './src/app/components',
  '@pages': './src/app/pages',
  '@utils': './src/app/utils',
  '@assets': './src/assets'
};

module.exports = config;