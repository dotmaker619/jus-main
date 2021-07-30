import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AuthService} from '@jl/common/core/services/auth.service';
import {Observable} from 'rxjs';

import { AppConfigService } from '../services/app-config.service';

/** Interceptor to provide auth information to request headers */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private appConfig: AppConfigService,
  ) {}

  /** Inject auth token in requests */
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getAuthToken();

    const shouldSetToken = req.url.startsWith(this.appConfig.apiUrl);

    if (authToken && shouldSetToken) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Token ${authToken}`),
      });

      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
