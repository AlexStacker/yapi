var fs = require('fs');
var path = require('path');
const {
  override,
  // useEslintRc,
  addLessLoader,
  addBabelPlugins,
  addWebpackResolve,
  addDecoratorsLegacy,
  removeModuleScopePlugin
  // addExternalBabelPlugins
} = require("customize-cra");
// var AssetsPlugin = require('assets-webpack-plugin');
// var CompressionPlugin = require('compression-webpack-plugin');
var commonLib = require('../common/plugin.js');

// var assetsPluginInstance = new AssetsPlugin({
//   filename: 'static/prd/assets.js',
//   processOutput: function(assets) {
//     return 'window.WEBPACK_ASSETS = ' + JSON.stringify(assets);
//   }
// });

// var package = require('./package.json');
// var yapi = require('./server/yapi');
// var isWin = require('os').platform() === 'win32'
let moduleFileExtensions = [];

const appDirectory = fs.realpathSync(process.cwd());

const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

module.exports = {
  // The Webpack config to use when compiling your react app for development or production.
  webpack: override(
    // useBabelRc(),
    // useEslintRc(),
    addLessLoader(),
    addWebpackResolve({
      alias: {
        'exts': path.resolve(process.cwd(), 'exts'),
        'client': path.resolve(process.cwd(), 'client'),
        'common': path.resolve(process.cwd(), 'common')
      }
      // modules: [
      //   path.resolve(process.cwd()),
      //   "node_modules"
      // ]
    }),
    addDecoratorsLegacy(),
    ...addBabelPlugins(
      "@babel/plugin-transform-runtime",
      "@babel/plugin-proposal-class-properties",
      [
        "webpack-alias",
        {
          "config": "webpack.alias.js"
        }
      ]
    ),
    removeModuleScopePlugin(),
    // ...addExternalBabelPlugins(
    //   "@babel/plugin-proposal-object-rest-spread"
    // )
  ),
  // The function to use to create a webpack dev server configuration when running the development
  // server with 'npm run start' or 'yarn start'.
  // Example: set the dev server to use a specific certificate in https.
  devServer: function (configFunction) {
    // Return the replacement function for create-react-app to use to generate the Webpack
    // Development Server config. "configFunction" is the function that would normally have
    // been used to generate the Webpack Development server config - you can use it to create
    // a starting configuration to then modify instead of having to create a config from scratch.
    return function (proxy, allowedHost) {
      // Create the default config by calling configFunction with the proxy/allowedHost parameters
      const config = configFunction(proxy, allowedHost);

      // Change the https certificate options to match your certificate, using the .env file to
      // set the file paths & passphrase.
      // const fs = require('fs');
      // config.https = {
      //   key: fs.readFileSync(process.env.REACT_HTTPS_KEY, 'utf8'),
      //   cert: fs.readFileSync(process.env.REACT_HTTPS_CERT, 'utf8'),
      //   ca: fs.readFileSync(process.env.REACT_HTTPS_CA, 'utf8'),
      //   passphrase: process.env.REACT_HTTPS_PASS
      // };

      config.proxy = {
        '/api': 'http://localhost:9090',
        secure: false
      }

      // Return your customised Webpack Development Server config.
      return config;
    };
  },
  // The paths config to use when compiling your react app for development or production.
  paths: function(config, env) {
    moduleFileExtensions = config.moduleFileExtensions;

    config['appBuild'] = resolveApp('static/dist');
    config['appPublic'] = resolveApp('static');
    config['appHtml'] = resolveApp('static/dev.html');
    config['appIndexJs'] = resolveModule(resolveApp, 'client/index');
    config['appSrc'] = resolveApp('client');

    // 整体替换掉src
    Object.keys(config).forEach((key) => {
      if(typeof config[key] === 'string' && /src/.test(config[key])) {
        config[key] = config[key].replace('src', 'client');
      }
    });

    return config;
  }
}

// var compressPlugin = new CompressionPlugin({
//   asset: '[path].gz[query]',
//   algorithm: 'gzip',
//   test: /\.(js|css)$/,
//   threshold: 10240,
//   minRatio: 0.8
// });

function createScript(plugin, pathAlias) {
  let options = plugin.options ? JSON.stringify(plugin.options) : null;
  if (pathAlias === 'node_modules') {
    return `"${plugin.name}" : {module: require('yapi-plugin-${
      plugin.name
      }/client.js'),options: ${options}}`;
  }
  return `"${plugin.name}" : {module: require('${pathAlias}/yapi-plugin-${
    plugin.name
    }/client.js'),options: ${options}}`;
}

function initPlugins(configPlugin) {
  configPlugin = require('../../config.json').plugins;
  var systemConfigPlugin = require('../common/config.js').exts;

  var scripts = [];
  if (configPlugin && Array.isArray(configPlugin) && configPlugin.length) {
    configPlugin = commonLib.initPlugins(configPlugin, 'plugin');
    configPlugin.forEach(plugin => {
      if (plugin.client && plugin.enable) {
        scripts.push(createScript(plugin, 'node_modules'));
      }
    });
  }

  systemConfigPlugin = commonLib.initPlugins(systemConfigPlugin, 'ext');
  systemConfigPlugin.forEach(plugin => {
    if (plugin.client && plugin.enable) {
      scripts.push(createScript(plugin, 'exts'));
    }
  });

  scripts = 'module.exports = {' + scripts.join(',') + '}';
  fs.writeFileSync('client/plugin-module.js', scripts);
}

// initPlugins();
