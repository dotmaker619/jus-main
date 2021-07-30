import { CommonModule } from '@angular/common';
import { Provider } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { httpInterceptorProviders } from '@jl/common/core/interceptors';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

/** Attorney app base imports. */
export const attorneyAppImports = [
  CommonModule,
  CommonSharedModule,
];

/** Attorney app base providers. */
export const attorneyAppProviders: Provider[] = [
  httpInterceptorProviders,
  FirebaseX,
];
