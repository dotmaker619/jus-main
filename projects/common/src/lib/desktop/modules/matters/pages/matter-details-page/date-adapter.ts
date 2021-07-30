import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {

  private readonly MONTHS_READABLE = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  /** @inheritdoc */
  public format(date: Date): string {
    return `${this.MONTHS_READABLE[date.getMonth()]}, ${date.getFullYear()}`;
  }
}
