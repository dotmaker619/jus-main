/**
 * Environment for public Development environment (usually hosted on saritasa-hosting).
 */
export const environment = {
  production: false,
  apiUrl: 'https://jlp-backend.saritasa-hosting.com/api/v1/',
  firebaseConfig: {
    apiKey: 'AIzaSyApdMeSLF6rVCXIctttCnbdWKRq7S9gnos',
    authDomain: 'juslaw-platform.firebaseapp.com',
    databaseURL: 'https://juslaw-platform.firebaseio.com',
    projectId: 'juslaw-platform',
    storageBucket: 'juslaw-platform.appspot.com',
    messagingSenderId: '912991333997',
  },
  chatsEnabled: true, // Disable for local development to prevent exceed default firestore limits.
  googleMap: {
    apiKey: 'AIzaSyCf0Q6gD9PHvdYW3clGMciVydTWNmJGfOw',
    libraries: ['places'],
    styles: [
      {
        'featureType': 'administrative',
        'elementType': 'labels.icon',
        'stylers': [
          {
            'visibility': 'off',
          },
        ],
      },
    ],
  },
  stripe: {
    publicKey: 'pk_test_xA3JvTbHZonV9MSmVepbyILv00Nccu24X3',
  },
  webApplicationVersionUrl: 'https://jlp-frontend.saritasa-hosting.com/',
  // tslint:disable-next-line:max-line-length
  clientDashboardVideo: 'https://s3.saritasa.io/jlp-dev/iStock-815362416.mp4',
  aboutUsPageUrl: 'https://jlp-wordpress.saritasa-hosting.com/',
  // tslint:disable-next-line: max-line-length
  pdfTronLicenseKey: 'JusGlobal LLC(jus-law.com):OEM:Jus-Law::B+:AMS(20210721):1DB5FB2204A7880AB360B13AC982737B60611FDB6436B523441294099D54200544B4BEF5C7',
};
