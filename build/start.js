const NODE_ENV = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const path = require('path');
// const fs = require('fs');
const overrides = require('./webpack.config');

// const root = path.resolve(fs.realpathSync(process.cwd()));
const modulePath = path.join(require.resolve('react-scripts/package.json'), '..');

const scriptPathsPath = path.join(modulePath, 'config/paths.js');
const webpackConfigPath = path.join(modulePath, 'config/webpack.config.js');
const devServerConfigPath = path.join(modulePath, 'config/webpackDevServer.config.js');

// load original configs
const pathsConfig = require(scriptPathsPath);
const configFactory = require(webpackConfigPath);
const devServerConfig = require(devServerConfigPath);

// override paths in memory
require.cache[require.resolve(scriptPathsPath)].exports = overrides.paths(pathsConfig, NODE_ENV);

// override config in memory
require.cache[require.resolve(webpackConfigPath)].exports = (env) => overrides.webpack(configFactory(env), env);

// override devServer in memory
require.cache[require.resolve(devServerConfigPath)].exports = overrides.devServer(devServerConfig, NODE_ENV);

// run original script
NODE_ENV === 'production' ? require('react-scripts/scripts/build') : require('react-scripts/scripts/start');