import { browser } from 'protractor';

/**
 * Application root page.
 */
export class AppPage {
  /**
   * Navigate to this page.
   */
  public navigateTo(): Promise<any> {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  // tslint:disable: comment-format
  // /**
  //  * Example of a method for a test.
  //  */
  // public getTitleText() {
  //   return element(by.css('app-root .content span')).getText() as Promise<string>;
  // }
  // tslint:enable: comment-format
}
