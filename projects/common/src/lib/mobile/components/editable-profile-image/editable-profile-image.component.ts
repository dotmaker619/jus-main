import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ProfileImageEditComponent } from '@jl/common/shared/components/profile-image-edit/profile-image-edit.component';

/** Profile image component. For mobile devices. */
@Component({
  selector: 'jlc-editable-profile-image',
  templateUrl: './editable-profile-image.component.html',
  styleUrls: ['./editable-profile-image.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableProfileImageComponent extends ProfileImageEditComponent {

}
