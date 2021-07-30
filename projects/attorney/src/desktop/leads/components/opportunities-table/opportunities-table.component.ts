import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Topic } from '@jl/common/core/models';
import { Author } from '@jl/common/core/models/author';
import { trackById } from '@jl/common/core/utils/trackby-id';

/** Opportunities table component. */
@Component({
  selector: 'jlat-opportunities-table',
  templateUrl: './opportunities-table.component.html',
  styleUrls: ['./opportunities-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunitiesTableComponent {
  /** Default profile image. */
  public readonly profileImageFallbackUrl = '/assets/avatar.png';

  /** Opportunities. */
  @Input()
  public opportunities: Topic[];

  /** Chat button click event. */
  @Output()
  public clickChat = new EventEmitter<Author>();

  /** Track by function. */
  public trackById = trackById;

  /** Emit clickChat event. */
  public onChatButtonClicked(clickEvent: Event, author: Author): void {
    clickEvent.preventDefault();
    /** Stop propagate click to parent anchor. */
    clickEvent.stopPropagation();
    this.clickChat.emit(author);
  }

}
