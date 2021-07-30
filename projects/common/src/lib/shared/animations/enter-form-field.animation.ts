import { trigger, transition, style, animate } from '@angular/animations';

export const ENTER_FORM_FIELD_ANIMATION = trigger(
    'enterFormFieldAnimation', [
    transition(':enter', [
        style({ transform: 'scaleY(0)', height: '0', opacity: 0 }),
        animate('300ms', style({ transform: 'scaleY(1)', height: '*', opacity: 1 })),
    ]),
    transition(':leave', [
        style({ transform: 'scaleY(1)', opacity: 1 }),
        animate('300ms', style({ transform: 'scaleY(0)', height: '0', opacity: 0 })),
    ]),
],
);
