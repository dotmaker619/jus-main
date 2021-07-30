import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  ViewChild,
  ElementRef,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { FileService } from '@jl/common/core/services/file.service';

/** Profile image component. */
@Component({
  selector: 'jlc-profile-image-edit',
  templateUrl: './profile-image-edit.component.html',
  styleUrls: ['./profile-image-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileImageEditComponent implements OnChanges {
  /** Profile image emitter. */
  @Output()
  public profileImageChange = new EventEmitter<File>();

  /**
   * Profile image.
   * File or an URL of image for preview.
   */
  @Input()
  public profileImage: File | string;

  /** Profile img url. */
  public profileImageUrl: SafeUrl;

  /**
   * Profile image name.
   */
  public profileImageName: string | null;

  @ViewChild('fileInput', { static: true })
  private fileInput: ElementRef<HTMLInputElement>;

  /**
   * @constructor
   * @param fileService File service.
   */
  public constructor(private fileService: FileService) { }

  /**
   * @inheritdoc
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('profileImage' in changes) {
      if (typeof this.profileImage === 'string' || this.profileImage == null) {
        // Use as-is since is not defined or URL.
        this.profileImageUrl = this.profileImage;
      } else {
        // This is a file.
        this.profileImageUrl = this.fileService.getFileUrl(this.profileImage);
        this.profileImageName = this.profileImage.name;
      }
    }
  }

  /** Handle image input. */
  public onProfileImageChange(files: FileList): void {
    this.profileImage = files.item(0);
    this.profileImageChange.emit(this.profileImage);
    this.profileImageName = this.profileImage.name;
    this.profileImageUrl = this.fileService.getFileUrl(this.profileImage);
  }

  /** Open file input. */
  public onProfileEditClick(): void {
    this.fileInput.nativeElement.click();
  }

  /** Remove profile image. */
  public onProfileRemoveClick(): void {
    this.profileImageChange.emit(null);
    this.profileImage = null;
    this.profileImageUrl = null;
    this.profileImageName = null;
    this.fileInput.nativeElement.value = null;
  }
}
