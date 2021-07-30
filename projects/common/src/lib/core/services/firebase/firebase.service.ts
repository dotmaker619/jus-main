import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable, NEVER } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';

import { FirestoreTokenDto } from '../../dto/firebase-token-dto';
import { CurrentUserService } from '../current-user.service';

/**
 * Firebase service.
 */
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private readonly firestoreCredentialsUrl = new URL('firestore/get-credentials/', this.appConfig.apiUrl).toString();

  /**
   * Firebase user.
   */
  public readonly firebaseUser$: Observable<firebase.User>;

  /**
   * @constructor
   * @param appConfig App config service.
   * @param http Http client service.
   * @param angularFireAuth Angular Firebase Authentication service.
   * @param angularFirestore Angular Firestore service.
   */
  constructor(
    private readonly userService: CurrentUserService,
    private readonly appConfig: AppConfigService,
    private readonly http: HttpClient,
    private readonly angularFireAuth: AngularFireAuth,
  ) {
    this.firebaseUser$ = this.signInForCurrentUser()
      .pipe(
        switchMap(() => this.angularFireAuth.authState),
        shareReplay({refCount: true, bufferSize: 1}),
      );
  }

  /**
   * Sign in to Firestore for a current application user.
   */
  private signInForCurrentUser(): Observable<firebase.auth.UserCredential> {
    return this.userService.currentUser$
      .pipe(
        switchMap(currentUser => {
          if (currentUser == null) {
            return NEVER;
          }
          return this.getFirestoreToken();
        }),
        switchMap(token => this.angularFireAuth.auth.signInWithCustomToken(token)),
      );
  }

  /**
   * Get fire store token from our API.
   */
  private getFirestoreToken(): Observable<string> {
    return this.http.get<FirestoreTokenDto>(this.firestoreCredentialsUrl)
      .pipe(
        map(({ token }) => token),
      );
  }
}
