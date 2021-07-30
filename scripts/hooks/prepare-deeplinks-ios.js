/**
 * Script to update deep link config inside of package.json and config.xml.
 */
module.exports = function(context) {
  const DEEPLINK_HOST_NAME = process.env['DEEPLINK_HOST_NAME'];

  if (DEEPLINK_HOST_NAME == null) {
    console.warn(
      'Deep links were not changed due to the absence of environment variable DEEPLINK_HOST_NAME.'
    );
    return;
  }
  const cordovaConfigUtil = require('@saritasa/cordova-build-utils/utils/cordova-config');
  const iOSConfigElementsXPath =
    './platform[@name="ios"]/config-file[@parent="com.apple.developer.associated-domains"]/array/string';
  const cordovaConfig = cordovaConfigUtil.readConfig();

  // Update for both configuration Debug and Release.
  const deepLinksConfigFiles = cordovaConfig.doc.findall(
    iOSConfigElementsXPath
  );
  deepLinksConfigFiles.forEach(
    element => (element.text = `applinks:${DEEPLINK_HOST_NAME}`)
  );

  // Save changes.
  cordovaConfig.write();
  console.log('iOS: Deep link host changed to', DEEPLINK_HOST_NAME);
};
