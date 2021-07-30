import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  HostListener,
  ElementRef,
} from '@angular/core';
import { trackById } from '@jl/common/core/utils/trackby-id';

const PLACEHOLDER = 'Search for attorney\'s name, keywords, etc.';

/** Person info. */
interface PersonInfo {
  /** Person's id. */
  id: number;
  /** Person's first name. */
  firstName: string;
  /** Person's last name. */
  lastName: string;
}

/** People filter input component. */
@Component({
  selector: 'jlc-people-filter-input',
  templateUrl: './people-filter-input.component.html',
  styleUrls: ['./people-filter-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleFilterInputComponent {

  @Input()
  public set placeholder(p: string) {
    this.placeholderValue = p;
  }

  /** Preselected people that can not be unselected. */
  @Input()
  public preselected: PersonInfo[] = [];

  /** Placeholder value. */
  public get placeholder(): string {
    return this.selected.length ? '' : this.placeholderValue;
  }

  /** Selected people. */
  @Input()
  public selected: PersonInfo[] = [];

  /** Filter value change. */
  @Output()
  public readonly ngModelChange = new EventEmitter<string>();

  /** Delete event emitter. */
  @Output()
  public readonly unselectClick = new EventEmitter<PersonInfo>();

  /** Enter clicked event. */
  @Output()
  public readonly enterClick = new EventEmitter<void>();

  /** Input element. */
  @ViewChild('filterInput', { static: true })
  public input: ElementRef<HTMLInputElement>;

  /** Trackby function. */
  public readonly trackById = trackById;

  private placeholderValue = PLACEHOLDER;

  /** Set focus on input when component clicked. */
  @HostListener('click')
  public setFocusOnInput(): void {
    this.input.nativeElement.focus();
  }

  /**
   * Emit value change.
   * @param value Value.
   */
  public onValueChange(value: string): void {
    this.ngModelChange.next(value);
  }

  /**
   * Uselect person.
   * @param person Person to unselect.
   */
  public onDeleteClicked(person: PersonInfo): void {
    this.unselectClick.next(person);
  }

  /**
   * Handle click on enter.
   */
  public onEnterClicked(): void {
    this.enterClick.next();
  }

  /**
   * Can person be unselected.
   * @param person Person info.
   */
  public canBeUnselected(person: PersonInfo): boolean {
    return this.preselected.find(({ id }) => person.id === id) == null;
  }
}
