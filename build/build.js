process.env.NODE_ENV = 'production';

const paths = require('./utils/paths');
const overrides = require('../config-overrides');
const webpackConfigPath = paths.scriptVersion + "/config/webpack.config";

// load original config
const configFactory = require(webpackConfigPath);

// override config in memory
require.cache[require.resolve(webpackConfigPath)].exports =
  (NODE_ENV) => overrides.webpack(configFactory(NODE_ENV), process.env.NODE_ENV || NODE_ENV);

// run original script
require(paths.scriptVersion + '/scripts/build');