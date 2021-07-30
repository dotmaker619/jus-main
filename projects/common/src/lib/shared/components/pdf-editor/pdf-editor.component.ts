import {
  Component,
  ChangeDetectionStrategy,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  NgZone,
} from '@angular/core';
import { DestroyableBase } from '@jl/common/core';
import { JlpFile } from '@jl/common/core/models/jlp-file';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import WebViewer, { WebViewerOptions, WebViewerInstance } from '@pdftron/webviewer';
import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';

/*
  We want to icon has the same color and size as other icons in toolbar.
  But if we put the icon via css, svg appears common img and it's color is black.
  That's the only way described in docs how to use svg.
*/
const SAVE_SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/>
<path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34
 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>`;

/**
 * Options for web-viewer initialization.
 */
const WEB_VIEWER_OPTIONS: WebViewerOptions = {
  path: 'public/webviewer/',
  fullAPI: true,
  enableRedaction: true,
};

/**
 * PDF editor component.
*/
@Component({
  selector: 'jlc-pdf-editor',
  templateUrl: './pdf-editor.component.html',
  styleUrls: ['./pdf-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfEditorComponent extends DestroyableBase implements AfterViewInit {
  /** URL to get pdf file. */
  @Input()
  public jlpDoc: JuslawDocument;
  /** Hide toolbar to make the component readonly. */
  @Input()
  public set hideToolbar(val: boolean) {
    this.hideToolbar$.next(val);
  }
  /** Emit value on 'Save'. */
  @Output()
  public readonly save = new EventEmitter<JlpFile>();
  /** Ref of 'viewer' to put 'pdftron WebViewer' instance. */
  @ViewChild('viewer', { static: true })
  public viewer: ElementRef;

  /**
   * Loading controller.
   */
  public readonly isLoading$ = new BehaviorSubject(false);

  private readonly hideToolbar$ = new ReplaySubject<boolean>(1);
  private webViewer: WebViewerInstance;

  /**
   * @constructor
   * @param ngZone NgZone.
   * @param appConfig App config service.
   */
  public constructor(
    private readonly ngZone: NgZone,
    private readonly appConfig: AppConfigService,
  ) {
    super();
  }

  /** @inheritdoc */
  public ngAfterViewInit(): void {
    if (!this.jlpDoc) {
      throw new Error('PDF url has to be passed');
    }
    this.initiateWebViewer({
      ...WEB_VIEWER_OPTIONS,
      initialDoc: this.jlpDoc.file,
      licenseKey: this.appConfig.pdfTronLicenseKey,
    });
  }

  /**
   * Initialize WebViewer and detach custom 'Save' button.
   *
   * @param options WebViewer options.
   */
  public async initiateWebViewer(options: WebViewerOptions): Promise<void> {
    this.webViewer = await WebViewer(options, this.viewer.nativeElement);

    // Detach save button.
    this.webViewer.setHeaderItems((header) => {
      header.push({
        type: 'actionButton',
        img: SAVE_SVG_ICON,
        dataElement: 'saveButton',
        onClick: () => this.onSaveClick(),
      });
    });

    this.hideToolbar$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((val) => {
      if (val) {
        this.webViewer.disableElements(['header']);
      } else {
        this.webViewer.enableElements(['header']);
      }
    });
  }

  /**
   * Handle 'click' of custom 'Save' button.
   *
   * @param docViewer Document viewer.
   * @param annotManager Annotation manager.
   */
  public onSaveClick(): void {
    /*
      PDF editor we use executes in iframe, 'zone' does not cover it
       hence we have to run this code with ngZone.
    */
    this.ngZone.run(async () => {
      try {
        this.isLoading$.next(true);
        const { docViewer, annotManager } = this.webViewer;
        const viewerDoc = docViewer.getDocument();
        const xfdfString = await annotManager.exportAnnotations();
        const data = await viewerDoc.getFileData({ xfdfString, downloadType: 'pdf' });
        const arr = new Uint8Array(data);
        const file = new JlpFile([arr], `${this.jlpDoc.trimFileExtension()}.pdf`, { type: 'application/pdf' });
        this.isLoading$.next(false);
        this.save.emit(file);
      } catch (err) {
        console.log(err);
      }
    });
  }
}
