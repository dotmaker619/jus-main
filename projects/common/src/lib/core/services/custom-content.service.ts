import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * About Us service.
 */
@Injectable({
  providedIn: 'root',
})
export class CustomContentService {

  /**
   * @constructor
   *
   * @param appConfig Application config.
   * @param httpClient Angular http client.
   * @param sanitizer Angular DOM Sanitizer.
   */
  public constructor(
    private readonly appConfig: AppConfigService,
    private readonly httpClient: HttpClient,
    private readonly sanitizer: DomSanitizer,
  ) {
  }

  /**
   * Return plain HTML string as Observable.
   */
  public getAboutPage(): Observable<SafeHtml> {
    const url = this.appConfig.aboutUsPageUrl;
    // Set response type as `object` because has issue https://github.com/angular/angular/issues/18586
    const requestOptions: Object = {
      responseType: 'text',
    };

    return this.httpClient.get<string>(url, requestOptions)
      .pipe(
        map(html => this.sanitizer.bypassSecurityTrustHtml(html)),
      );
  }
}
