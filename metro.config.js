const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable better debugging
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Better error messages in development
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Exclude problematic Windows directories from file watching
config.resolver.blockList = [
  /node_modules[\/\\]\.bin[\/\\].*/,
  /__tests__[\/\\].*/,
  /\.git[\/\\].*/,
];

// Windows-specific fix: disable file watcher and use polling
config.watchFolders = [];
config.watcher = {
  additionalExts: ['ts', 'tsx'],
  watchman: {
    deferStates: ['hg.update'],
  },
  healthCheck: {
    enabled: false,
  },
};

module.exports = config;