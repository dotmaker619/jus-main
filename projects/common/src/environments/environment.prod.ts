export const environment = {
  production: true,
  apiUrl: 'https://backend.jus-law.com/api/v1/',
  firebaseConfig: {
    apiKey: 'AIzaSyBHyXQeoz8-WQ7PSKYtN-Lw5bIBP_LFwZQ',
    authDomain: 'juslaw-platform-3fe6d.firebaseapp.com',
    databaseURL: 'https://juslaw-platform-3fe6d.firebaseio.com',
    projectId: 'juslaw-platform-3fe6d',
    storageBucket: 'juslaw-platform-3fe6d.appspot.com',
    messagingSenderId: '611393393169',
  },
  chatsEnabled: true,
  googleMap: {
    apiKey: 'AIzaSyBHyXQeoz8-WQ7PSKYtN-Lw5bIBP_LFwZQ',
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
    // tslint:disable-next-line: comment-format
    // publicKey: 'pk_test_2JoiXOIp25mp6ki59uqCOvW8',
    // tslint:disable-next-line: comment-format
    publicKey: 'pk_live_8kHQq7Esqylmfjj1UqQma3yY',
  },
  webApplicationVersionUrl: 'https://app.jus-law.com/',
  // tslint:disable-next-line:max-line-length
  clientDashboardVideo: 'https://jlp-production.s3-us-west-2.amazonaws.com/iStock-815362416.mp4',
  aboutUsPageUrl: 'https://jus-law.com/',
  // tslint:disable-next-line: max-line-length
  pdfTronLicenseKey: 'JusGlobal LLC(jus-law.com):OEM:Jus-Law::B+:AMS(20210721):1DB5FB2204A7880AB360B13AC982737B60611FDB6436B523441294099D54200544B4BEF5C7',
};
