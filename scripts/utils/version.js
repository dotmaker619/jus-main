const packageConfig = require('../../package.json');

/**
 * Obtains version info from package.json and env variables.
 */
function getApplicationVersionInfo() {
  const versionName = packageConfig.version;
  const [major, minor, patch] = packageConfig.version.split('.').map(versionPart => parseInt(versionPart, 10));
  // Try get build number from jenkins parameter.
  const parsedBuildNumber = parseInt(process.env.BUILD_NUMBER, 10);
  const buildNumber = Number.isNaN(parsedBuildNumber)
    ? null
    : parsedBuildNumber;
  return {
    major,
    minor,
    patch,
    buildNumber,
    versionName,
    versionCode: major * 10000 + minor * 100 + patch,
  };
}

module.exports = {
  getApplicationVersionInfo,
};
