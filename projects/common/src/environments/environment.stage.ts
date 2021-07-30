export const environment = {
  production: true,
  apiUrl: 'https://jlp-stage-backend.saritasa-hosting.com/api/v1/',
  firebaseConfig: {
    'apiKey': 'AIzaSyA0AUK5zcMsIkN5E8oDvKkPHtO8-bDeBWw',
    'appId': '1:972650587374:web:f0ba85b130f46372907fff',
    'authDomain': 'jlp-staging.firebaseapp.com',
    'databaseURL': 'https://jlp-staging.firebaseio.com',
    'messagingSenderId': '972650587374',
    'projectId': 'jlp-staging',
    'storageBucket': 'jlp-staging.appspot.com',
  },
  chatsEnabled: true,
  googleMap: {
    apiKey: 'AIzaSyD2tf3LK2I65AS5TVr5DE2C067Q_Le2uTs',
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
    publicKey: 'pk_test_JcpnfgsRRQOJWyCGpQVR4pOV00fPZG0gKU',
  },
  webApplicationVersionUrl: 'https://jlp-stage-frontend.saritasa-hosting.com/',
  clientDashboardVideo: 'https://jlp-production.s3-us-west-2.amazonaws.com/iStock-815362416.mp4',
  aboutUsPageUrl: 'https://jlp-stage-frontend.saritasa-hosting.com/',
  // tslint:disable-next-line: max-line-length
  pdfTronLicenseKey: 'JusGlobal LLC(jus-law.com):OEM:Jus-Law::B+:AMS(20210721):1DB5FB2204A7880AB360B13AC982737B60611FDB6436B523441294099D54200544B4BEF5C7',
};
