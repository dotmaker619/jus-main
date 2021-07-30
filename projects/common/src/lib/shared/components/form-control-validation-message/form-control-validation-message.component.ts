import { Component, ChangeDetectionStrategy, Input, Optional, Host, SkipSelf, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { ControlContainer, AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

/**
* Form control validation message component.
* Render error message for the target form control.
*/
@Component({
  selector: 'jlc-form-control-validation-message',
  templateUrl: './form-control-validation-message.component.html',
  styleUrls: ['./form-control-validation-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormControlValidationMessageComponent implements OnChanges, DoCheck {
  /**
   * @constructor
   * @param parent Parent form control container.
   */
  public constructor(
    @Optional() @Host() @SkipSelf() private parent: ControlContainer,
  ) {
  }

  /**
  * Target form control name.
  */
  @Input()
  public controlName?: string;

  /**
   * Target form control.
   */
  @Input()
  public control?: AbstractControl;

  /**
   * Form control.
   */
  public formControl$ = new BehaviorSubject<AbstractControl>(null);

  /**
   * @inheritdoc
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (this.control != null && this.controlName != null) {
      throw new Error('You can not specify the both: `control` and `controlName`. Use only one of them.');
    }
    let formControl = this.control;
    if ('controlName' in changes && this.controlName != null) {
      formControl = this.parent.control.get(this.controlName.toString());
    }
    this.formControl$.next(formControl);
  }

  /**
   * @inheritdoc
   */
  public ngDoCheck(): void {
    // Re-get form control on do check, because parent FormControl could be re-created.
    let formControl = this.control;
    if (this.controlName != null) {
      formControl = this.parent.control.get(this.controlName.toString());
    }
    this.formControl$.next(formControl);
  }

  /**
   * Should error message be displayed.
   * @param control control to check.
   */
  public shouldDisplayErrorMessage(control: AbstractControl): boolean {
    // Display if a user changed value or value already presented (pre-initialized).
    const hasValue = control.value != null && control.value !== '';

    return control.touched || control.dirty || (hasValue && control.errors != null);
  }
}
