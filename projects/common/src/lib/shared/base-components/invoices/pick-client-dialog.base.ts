import { AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { QuickbooksClient } from '@jl/common/core/models/quickbooks-client';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable, ReplaySubject, combineLatest, of } from 'rxjs';
import { switchMap, startWith, map } from 'rxjs/operators';

import { AbstractDialog } from '../..';

interface PickClientDialogOptions {
  /** Available clients. */
  clients: QuickbooksClient[];
  /** Preselected one. */
  preselectedClient?: QuickbooksClient;
}
const INITIAL_QUERY_VALUE = '';
/** Base dialog to pick quickbooks client. */
export class BasePickClientDialog
  extends AbstractDialog<PickClientDialogOptions, QuickbooksClient | undefined>
  implements AfterViewInit {
  /** Clients container. */
  @ViewChildren('li.client')
  public clientsContainer: QueryList<ElementRef<HTMLElement>>;
  /** Clients filter form. */
  public readonly filterForm$: Observable<FormGroup>;
  /** Selected client passed as property. */
  public preselectedClient: QuickbooksClient;
  /** Clients to select. */
  public readonly filteredClients$: Observable<QuickbooksClient[]>;
  /** Trackby function. */
  public trackById = trackById;

  /** Clients passed as property. */
  private readonly clients$ = new ReplaySubject<QuickbooksClient[]>(1);

  /** Options setter. */
  public set options(v: PickClientDialogOptions) {
    this.preselectedClient = v.preselectedClient;
    this.clients$.next(v.clients);
  }

  /**
   * @constructor
   * @param formBuilder Form builder.
   */
  public constructor(
    protected readonly formBuilder: FormBuilder,
  ) {
    super();
    this.filterForm$ = this.initFilterFormStream();
    this.filteredClients$ = this.initClientsStream();
  }

  /** @inheritdoc */
  public ngAfterViewInit(): void {
    if (this.preselectedClient) {
      const foundClientItem = this.clientsContainer.find(el =>
        el.nativeElement.id === this.obtainClientItemId(this.preselectedClient));
      if (foundClientItem) {
        foundClientItem.nativeElement.scrollIntoView();
      }
    }
  }

  /**
   * Get id for item in a client list.
   * @param client Client.
   */
  public obtainClientItemId(client: QuickbooksClient): string {
    return `quickbooks-client-item-${client.id}`;
  }

  private initClientsStream(): Observable<QuickbooksClient[]> {
    const query$: Observable<string> = this.filterForm$.pipe(
      switchMap(form => form.controls.query.valueChanges),
      startWith(INITIAL_QUERY_VALUE),
    );
    return combineLatest([
      query$,
      this.clients$,
    ]).pipe(
      map(([query, clients]) =>
        clients.filter((c) =>
          this.matchClientWithQuery(c, query))),
    );
  }

  private matchClientWithQuery(this: void, client: QuickbooksClient, query: string): boolean {
    const stringToMatch = [
      client.companyName,
      client.displayName,
      client.email,
      client.firstName,
      client.lastName,
    ].join('').toLowerCase();
    return stringToMatch.match(query.toLowerCase()) != null;
  }

  private initFilterFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      query: [INITIAL_QUERY_VALUE],
    });

    return of(form);
  }
}
