// Default Expo config, plus the on-phone model files as bundled assets (never downloaded at runtime).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('pte', 'tok');

module.exports = config;
