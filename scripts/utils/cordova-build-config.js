/**
* The module loads (sync) buildConfig using the cordova's context:
* -> platform, cli options
* -> path of buildConfig-file, build type
* -> buildConfig-file
* -> config relevant to platform & build type
*/
const path = require('path');

const RELEASE_BUILD_TYPE = 'release';
const DEBUG_BUILD_TYPE = 'debug';

/**
* Read cordova build config for specific context.
* @param {CordovaContext} context
* @return {object}
*/
function readConfig({opts: {options: {buildConfig = 'build.json', release} = {}, projectRoot, platforms: [platform]} = {}} = {}) {
  if (!platform) {
    throw new Error('You should specify platform');
  }
  
  const buildType = release
    ? RELEASE_BUILD_TYPE
    : DEBUG_BUILD_TYPE;
  
  if (!path.isAbsolute(buildConfig)) {
    buildConfig = path.join(projectRoot, buildConfig);
  }
  
  const {[platform]: {[buildType]: config = {}} = {}} = require(buildConfig) || {};
  
  return config;
}

module.exports = {
  readConfig,
};
