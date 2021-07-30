import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { File } from '@ionic-native/file/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { SafariViewController } from '@ionic-native/safari-view-controller/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule } from '@ionic/angular';
import { CordovaFileService } from '@jl/attorney/shared/services/cordova-file.service';
import { CoreModule } from '@jl/common/core';
import { NotFoundErrorHandler } from '@jl/common/core/error-handlers/not-found-error-handler';
import { httpInterceptorProviders } from '@jl/common/core/interceptors';
import { MediaRecordingService } from '@jl/common/core/services/abstract-media-recording.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { CordovaExternalResourcesService } from '@jl/common/core/services/cordova-external-resources.service';
import { CordovaMediaRecordingService } from '@jl/common/core/services/cordova-media-recording.service';
import { DeviceAuthService } from '@jl/common/core/services/device-auth.service';
import { ExternalResourcesService } from '@jl/common/core/services/external-resources.service';
import { FileService } from '@jl/common/core/services/file.service';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { AppRoutingModule } from '@jl/common/navigation/app-routing.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';
import { environment } from '@jl/env/environment';
import { NgxMaskModule } from 'ngx-mask';
import { NgxPermissionsModule } from 'ngx-permissions';

import { AppComponent } from './app.component';
/**
 * Application root module.
 */
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    CommonSharedModule,
    CommonMobileModule,
    AgmCoreModule.forRoot(environment.googleMap),
    NgxPermissionsModule.forRoot(),
    NgxMaskModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    IonicModule.forRoot(),
  ],
  providers: [
    StatusBar,
    httpInterceptorProviders,
    { provide: FileService, useClass: CordovaFileService },
    { provide: ExternalResourcesService, useClass: CordovaExternalResourcesService },
    { provide: MediaRecordingService, useClass: CordovaMediaRecordingService },
    { provide: AuthService, useClass: DeviceAuthService },
    { provide: ErrorHandler, useClass: NotFoundErrorHandler },
    MediaCapture,
    File,
    FirebaseX,
    SocialSharing,
    Deeplinks,
    StatusBar,
    SafariViewController,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
