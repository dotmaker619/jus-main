import { CommonModule } from '@angular/common';
import { Provider } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { httpInterceptorProviders } from '@jl/common/core/interceptors';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

/** Client app base imports. */
export const clientAppImports = [
  CommonModule,
  CommonSharedModule,
];

/** Client app base providers. */
export const clientAppProviders: Provider[] = [
  httpInterceptorProviders,
  FirebaseX,
];
