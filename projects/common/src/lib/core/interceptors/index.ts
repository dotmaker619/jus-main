import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@jl/common/core/interceptors/auth-interceptor';

/** Http interceptor providers */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];
