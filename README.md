# Jus Law

This is a workspace of multiple Angular projects.

## Common

Contains common Angular X modules that can be reused by other high-level modules:

1. core - models and services;
1. shared - contains shared components.

## Web

Entry point for Web application. Contains web-app specific elements.

## Tablet

Entry point for Tablet application. Contains tablet specific elements.

# Building process

This project was generated with [Angular CLI](https://github.com/angular/angular-cli). Use `npm run ng` command for build certain application.

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Building Web application

This is the default project, so the `--project` argument can be omitted.
To build Web application use common Angular CLI commands. For instance:

1. For local working: `npm run ng -- serve [options] --project=web-app` or `npm start`.
1. For build result assets: `npm run ng -- build [options] --project=web-app` or `npm build`.

## Building Tablet application

### Config of application

We use extended [Cordova build config](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/#using-buildjson) file. We added support of "bundleId" property for certain configuration:

```json
{
	"<platform>": {
		"<mode>": {
      "bundleId": "some.bundle.id.specific.for.current.mode",
			...,
		},
		...
	},
	...
}
```
sds6ntul
The `development/scripts/hooks/prepare-cordova-config.js` script will replace bundle ID in `config.xml` file to bundle ID of certain platform and mode.

For the production environment, we have different bundle IDs for iOS and Android applications because the iOS team registered bundle ID with a dash but this symbol is not permitted for Android bundle ID so we had to use another bundle ID.

`com.jusglobal.jus-law` - bundle ID for iOS production application.
`com.jusglobal.juslaw` - bundle ID for Android production applciaiton.

Configs for every bundle ID are placed in the `artifacts` directory where the name of a directory has the name of a bundle ID.

Before build the application for certain platform and environment you should copy Google Service configs into the `development` directory. Cordova build config can be passed through `--buildConfig` argument of Cordova CLI command.

**Note:** store password and key password replaced with a placeholder. The real values are stored in https://vault.saritasa.io/v1/projects/jlp-frontend-develop.

**Note on deeplinks configuration:** Before building you should set correct deep links configuration to exported environment variable `DEEPLINK_HOST_NAME`.

e.g.: `export DEEPLINK_HOST_NAME=jus-law.com`

### Building

To build application use Ionic CLI commands.

1. For local working: `npx ionic serve --project=mobile-app` or `npm run serve-tablet`
2. To build result on android: `npx ionic cordova build android --project=mobile-app` or `npm run build-tablet-android`
3. To build result on ios: `npx ionic cordova build ios --project=mobile-app` or `npm run build-tablet-ios`
4. To build for app store: `npm run build-appstore-ios`
   AppStore Certificate: https://keys.saritasa.com/cred/detail/8883/

#### Building the Android application for production environment:

```
cp ./artifacts/com.jusglobal.juslaw/google-services.json ./development
cd ./development
npm i
npx ionic cordova build android --device --release --prod --project=mobile-app --buildConfig=../artifacts/com.jusglobal.juslaw/build.json
```

#### Building the iOS application for production environment:

```
npm run build-appstore-ios
```
