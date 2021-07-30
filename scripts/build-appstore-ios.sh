#!/usr/bin/env bash

export DEEPLINK_HOST_NAME=jus-law.com
cd ..
cp ./artifacts/com.jusglobal.jus-law/GoogleService-Info.plist ./development
cd ./development
rm -rf platforms plugins
npm i
npx ionic cordova build ios --device --release --prod --project=mobile-app --buildConfig=../artifacts/com.jusglobal.jus-law/build.json
