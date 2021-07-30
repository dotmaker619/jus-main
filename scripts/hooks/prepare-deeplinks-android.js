#!/usr/bin/env node
const AndroidManifest = require('androidmanifest');

module.exports = function(context) {
  const DEEPLINK_HOST_NAME = process.env['DEEPLINK_HOST_NAME'];

  if (DEEPLINK_HOST_NAME == null) {
    console.warn(
      'Deep links were not changed due to the absence of environment variable DEEPLINK_HOST_NAME.'
    );
    return;
  }
  const root = context.opts.projectRoot;
  const manifestFilePath =
    root + '/platforms/android/app/src/main/AndroidManifest.xml';

  const manifest = new AndroidManifest().readFile(manifestFilePath);

  manifest
    .activity('MainActivity')
    .find('intent-filter > data[android\\:host]')
    .first()
    .attr({ 'android:host': DEEPLINK_HOST_NAME });

  manifest.writeFile(manifestFilePath);
  console.log('Android: Deep link host changed to', DEEPLINK_HOST_NAME);
};
