/**
* This hook need to prepare cordova config file.
*/
const cordovaBuildConfig = require('../utils/cordova-build-config');
const cordovaConfig = require('../utils/cordova-config');
const { getApplicationVersionInfo } = require('../utils/version');

module.exports = function (context) {
  console.log('Prepare cordova config hook');

  // open cordova's config.xml
  const config = cordovaConfig.readConfig();

  // get version from version.json & environment (jenkins)
  const version = getApplicationVersionInfo();
  const { buildNumber, versionName, versionCode } = version;

  // Set version for cordova app.
  if (buildNumber != null) {
    config.setVersion(`${versionName}.build-${buildNumber}`);
  }

  config.doc.getroot().set('android-versionCode', versionCode);
  config.doc.getroot().set('ios-CFBundleVersion', versionCode);

  // get bundle id from build config
  const {bundleId} = cordovaBuildConfig.readConfig(context)

  if (bundleId && bundleId !== config.packageName()) {
    console.log('Replace bundleId to ', bundleId)
    config.setPackageName(bundleId)
  }

  // save changed configuration
  config.write();
}
