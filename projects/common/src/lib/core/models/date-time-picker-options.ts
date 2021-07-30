import { PickerOptions } from '@ionic/core';

/** Date-time picker options. */
export interface DateTimePickerOptions {
  /** Minimum date-time allowed. */
  min?: string;
  /** Maximum date-time allowed. */
  max?: string;
  /** Display format. */
  displayFormat?: string;
  /** Picker options. See: https://ionicframework.com/docs/api/picker*/
  pickerOptions?: PickerOptions;
  /** Placeholder. */
  placeholder?: string | null;
}
