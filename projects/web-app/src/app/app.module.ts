
import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { File } from '@ionic-native/file/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { SafariViewController } from '@ionic-native/safari-view-controller/ngx';
import { IonicModule } from '@ionic/angular';
import { CoreModule } from '@jl/common/core';
import { NotFoundErrorHandler } from '@jl/common/core/error-handlers/not-found-error-handler';
import { httpInterceptorProviders } from '@jl/common/core/interceptors';
import { MediaRecordingService } from '@jl/common/core/services/abstract-media-recording.service';
import { FileService } from '@jl/common/core/services/file.service';
import { AppRoutingModule } from '@jl/common/navigation/app-routing.module';
import { BrowserMediaRecordingService } from '@jl/common/shared/services/browser-media-recording.service';
import { CommonSharedModule } from '@jl/common/shared/shared.module';
import { environment } from '@jl/env/environment';
import { NgxMaskModule } from 'ngx-mask';
import { NgxPermissionsModule } from 'ngx-permissions';

import { AppComponent } from './app.component';

/**
 * Application root module.
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    CoreModule,
    CommonSharedModule,
    AgmCoreModule.forRoot(environment.googleMap),
    NgxPermissionsModule.forRoot(),
    NgxMaskModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    IonicModule.forRoot(),
  ],
  providers: [
    httpInterceptorProviders,
    { provide: MediaRecordingService, useClass: BrowserMediaRecordingService },
    FileService,
    FirebaseX,
    MediaCapture,
    File,
    { provide: ErrorHandler, useClass: NotFoundErrorHandler },
    SafariViewController,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
