
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { DestroyableBase } from '@jl/common/core';
import { ChatInfo } from '@jl/common/core/models/chat-info';
import { Message } from '@jl/common/core/models/chat/message';
import { CursorPagination, CursorPaginationDirection } from '@jl/common/core/models/cursor-pagination';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { ChatService } from '@jl/common/core/services/chats/chat.service';
import { JusLawDateUtils } from '@jl/common/core/utils/date-utils';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable, BehaviorSubject, fromEvent, Subject, ReplaySubject, of, merge, Subscription, NEVER, EMPTY, combineLatest } from 'rxjs';
import {
  startWith,
  filter,
  withLatestFrom,
  shareReplay,
  switchMap,
  debounceTime,
  map,
  switchMapTo,
  tap,
  take,
  distinctUntilKeyChanged,
  mapTo,
  takeUntil,
  scan,
  concatMap,
  defaultIfEmpty,
  throttleTime,
  share,
  first,
} from 'rxjs/operators';

import { ChatMessageComponent } from './chat-message/chat-message.component';

interface TextMessageInfo {
  /** Attached files. */
  readonly files: File[];
  /** Message text. */
  readonly text: string;
}

type LoadDataFunction<Q, D> = (
  query: Q,
  direction: CursorPaginationDirection,
  lastPage: CursorPagination<D>,
) => Observable<CursorPagination<D>>;

/**
 * Controller for cursor pagination.
 */
export class CursorPaginator<T, D = never, S extends CursorPagination<T> = never> {
  /** Shows whether there are more items before. */
  public readonly haveMorePrevious$: Observable<boolean>;
  /** Shows if there are items after the initial page. */
  public readonly haveMoreNext$: Observable<boolean>;
  /** Lazy loaded items. */
  public readonly items$: Observable<CursorPagination<T>[] | null>;

  /** Page of data. */
  private readonly savedItems$: BehaviorSubject<CursorPagination<T>[] | null>;
  /** Emitted when need to load data either from the start or end of list. */
  private readonly load$: Subject<CursorPaginationDirection>;

  /** Subscription on container scroll events. */
  private containerScrollSubscription!: Subscription;

  /**
   * @constructor
   * @param loadData Function loading the data for query and page.
   * @param query$ Query change emitter.
   * @param options Pagination options.
   */
  public constructor(
    loadData: LoadDataFunction<D, T>,
    query$: Observable<D> = EMPTY,
    startWith$: Observable<S> = EMPTY,
  ) {
    this.load$ = new Subject();
    this.savedItems$ = new BehaviorSubject<CursorPagination<T>[] | null>(null);

    const queryChange$ = query$.pipe(
      defaultIfEmpty(),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this.haveMoreNext$ = this.savedItems$.pipe(
      // Check whether the last page points that there is more
      map(pages => pages && pages.slice(-1)[0].next),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
    this.haveMorePrevious$ = this.savedItems$.pipe(
      map(pages => pages && pages[0].prev || false),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this.items$ = this.initDataAccumulationStream(
      queryChange$,
      loadData,
      startWith$,
    );
  }

  private initDataAccumulationStream(
    queryChange$: Observable<D | never>,
    loadData: LoadDataFunction<D, T>,
    startWith$: Observable<S>,
  ): Observable<CursorPagination<T>[] | null> {
    const requestedPage$ = this.load$.pipe(
      withLatestFrom(queryChange$, this.savedItems$),
      concatMap(([direction, query, loadedPages]) => {
        let pageToStartPagination: CursorPagination<T>;
        if (direction === 'tail' && loadedPages) {
          pageToStartPagination = loadedPages[loadedPages.length - 1];
        } else if (direction === 'head' && loadedPages) {
          pageToStartPagination = loadedPages[0];
        }
        return loadData(query, direction, pageToStartPagination).pipe(take(1));
      }),
    );

    const accumulateData$ = startWith$.pipe(
      switchMap(initialData => requestedPage$.pipe(startWith(initialData))),
      scan<CursorPagination<T>, CursorPagination<T>[]>((acc, newData) => {
        if (newData.position === 'head') {
          return [newData].concat(acc);
        } else if (newData.position === 'tail') {
          return acc.concat(newData);
        }
        return [newData];
      }, []),
    );

    return queryChange$.pipe(
      tap(() => this.savedItems$.next(null)),
      switchMapTo(accumulateData$),
      tap(accumulatedPages => this.savedItems$.next(accumulatedPages)),
      switchMapTo(this.savedItems$),
    );
  }

  /**
   * Handle scrolling events on pagination container.
   * @param element Pagination container.
   */
  public attachTo(
    element: HTMLElement,
    scrollDebounceTime: number = 300,
    loaderOffsetPx: number = 100,
  ): void {
    const handleScroll$ = merge(fromEvent(element, 'scroll'), this.savedItems$).pipe(
      debounceTime(scrollDebounceTime),
      withLatestFrom(this.haveMorePrevious$, this.haveMoreNext$),
      tap(([_, morePrev, moreNext]) => {
        if (this.elScrolledToTop(element, loaderOffsetPx) && morePrev) {
          element.scrollTo({ top: loaderOffsetPx });
          this.load$.next('head');
        } else if (this.elScrolledToBottom(element, loaderOffsetPx) && moreNext
        ) {
          this.load$.next('tail');
        }
      }),
    );
    this.containerScrollSubscription = handleScroll$.subscribe();
  }

  /** Detach lazy loading controller from a container. */
  public detach(): void {
    this.containerScrollSubscription.unsubscribe();
  }

  private elScrolledToTop(elem: HTMLElement, offset: number): boolean {
    return elem.scrollTop < offset;
  }

  private elScrolledToBottom(
    elem: HTMLElement,
    offset: number,
  ): boolean {
    const topOffset = elem.offsetHeight + offset;
    return elem.scrollTop >= elem.scrollHeight - topOffset;
  }
}

/** Offset in px at which we want to stick scroll to the bottom when new messages arrive. */
const OFFSET_TO_ADJUST_SCROLL = 400;

/** Offset from which we want to show the button that scroll chat to the bottom. */
const SCROLL_BUTTON_OFFSET = 300;

/**
 * Chat component.
 */
@Component({
  selector: 'jlc-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent extends DestroyableBase implements AfterViewInit, OnDestroy {
  /** Are files being loaded. */
  public readonly filesLoading$ = new BehaviorSubject<boolean>(false);
  /** Selected chat. */
  public readonly chat$ = new BehaviorSubject<ChatInfo>(null);
  /** Lazy loading controller. */
  public readonly lazyLoader: CursorPaginator<Message, ChatInfo>;
  /** Is button for scrolling to the end of chat visible. */
  public readonly isScrollButtonVisible$: Observable<boolean>;

  /** Messages container, supposed to be emitted only once on init. */
  private readonly messagesContainer$ = new ReplaySubject<ElementRef<HTMLElement>>(1);
  /** Emitted when new message is sent by the user. */
  private readonly newMessage$ = new Subject<TextMessageInfo>();
  /** Subject emitted when chat reload is required. */
  private readonly reloadChat$ = new Subject<void>();
  /** Last page requested. */
  private readonly lastPageRequested$ = new Subject<void>();

  /** Messages container. */
  @ViewChild('messagesContainer', { static: true })
  public set messagesContainer(e: ElementRef<HTMLElement>) {
    this.messagesContainer$.next(e);
  }

  /** Message elements. */
  @ViewChildren(ChatMessageComponent)
  public chatMessages: QueryList<ChatMessageComponent>;

  /** Selected chat. */
  @Input()
  public set chat(value: ChatInfo) {
    this.chat$.next(value);
  }

  /** Define whether the info about message's author is visible. */
  @Input()
  public visibleAuthors = false;

  /** Current chat messages. */
  public readonly messages$: Observable<Message[] | null>;

  /** Error loading chat. */
  public readonly errorLoadingChat$ = new ReplaySubject<boolean>(1);

  /** Attached files to a message. */
  public attachedFiles: File[] = [];

  /** Trackby function. */
  public readonly trackById = trackById;

  /**
   * @constructor
   * @param chatService Chat service.
   */
  public constructor(
    private readonly chatService: ChatService,
  ) {
    super();
    /** User changed the chat. */
    const chatChange$ = this.reloadChat$.pipe(
      startWith(null),
      switchMapTo(this.chat$.pipe(
        filter(chat => chat != null),
        distinctUntilKeyChanged('id'),
      )),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    /** Initial page load. By default the page with last read message is loaded. */
    const initialPageChange$ = chatChange$.pipe(
      switchMap((chat) => this.chatService.getMessagesPageWithLastRead(chat)),
    );

    /** User requested the last page. The pagination is meant to be reset after this event. */
    const lastPageRequested$ = this.lastPageRequested$.pipe(
      withLatestFrom(chatChange$),
      switchMap(([_, chat]) => this.chatService.getLastPageMessages(chat)),
    );

    this.lazyLoader = new CursorPaginator(
      this.loadMessagesPage.bind(this),
      chatChange$,
      merge(initialPageChange$, lastPageRequested$),
    );
    this.messages$ = this.initMessagesStream();
    this.isScrollButtonVisible$ = this.initButtonVisibilityStream();
  }

  private initButtonVisibilityStream(): Observable<boolean> {
    const container$ = this.messagesContainer$.pipe(
      first(),
      map(container => container.nativeElement),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    const offsetFromBottom$ = container$.pipe(
      switchMap(container => {
        return fromEvent(container, 'scroll').pipe(
          debounceTime(300),
          map(() => container.scrollHeight - container.offsetHeight - container.scrollTop),
        );
      }),
    );

    const isFarFromBottom$ = offsetFromBottom$.pipe(
      map(offset => offset > SCROLL_BUTTON_OFFSET),
    );

    return combineLatest([
      isFarFromBottom$,
      this.lazyLoader.haveMoreNext$,
    ]).pipe(
      map(([isFarFromBottom, haveMoreToLoad]) => haveMoreToLoad || isFarFromBottom),
    );
  }

  private loadMessagesPage(
    chat: ChatInfo,
    direction: CursorPaginationDirection,
    lastPage: CursorPagination<Message> | null): Observable<CursorPagination<Message>> {
    return this.chatService.getMessagesPage(
      chat,
      lastPage,
      direction,
    );
  }

  private hasOffsetFromTop(offset: number): Observable<boolean> {
    return this.messagesContainer$.pipe(
      map(({ nativeElement }) => nativeElement.scrollTop < (nativeElement.scrollHeight -
        nativeElement.offsetHeight) - offset),
      take(1),
    );
  }

  /**
   * @inheritdoc
   */
  public ngAfterViewInit(): void {
    // Containers and other data

    /** Messages container. */
    const messagesContainer$ = this.messagesContainer$.pipe(
      map(({ nativeElement }) => nativeElement),
      take(1),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    // Chat events

    /** Emits when new messages rendered. */
    const chatElementsChange$ = this.chatMessages.changes.pipe(
      filter(messages => messages.length),
      share(),
    );

    /** New message arrived while scroll is not far from the bottom. */
    const newMessageAtEnd$ = chatElementsChange$.pipe(
      switchMapTo(this.hasOffsetFromTop(OFFSET_TO_ADJUST_SCROLL)),
      filter((hasOffset) => !hasOffset),
      share(),
    );

    /** Message is sent by the user and the last page is loaded */
    const messageSentByUser$ = this.newMessage$.pipe(
      switchMapTo(chatElementsChange$.pipe(take(1))),
      share(),
    );

    /** Got last page when it was explicitly requested */
    const gotLastPage$ = this.lastPageRequested$.pipe(
      withLatestFrom(this.lazyLoader.haveMoreNext$),
      switchMap(([_, haveMoreNext]) =>
        // Check whether the last page is already loaded, otherwise wait for the render
        haveMoreNext ? chatElementsChange$.pipe(take(1)) : of(null)),
      mapTo(void 0),
      share(),
    );

    const sentMessageWhileNotLoadedLastPage$ = this.newMessage$.pipe(
      withLatestFrom(this.lazyLoader.haveMoreNext$),
      filter(([_, haveMoreAtBottom]) => haveMoreAtBottom),
      share(),
    );

    // Side effects

    /** Controls sending of messages to the chat.  */
    const sendNewMessage$ = this.newMessage$.pipe(
      withLatestFrom(this.chat$),
      switchMap(([message, chat]) => {
        const message$ = this.chatService.sendTextMessage(chat, message.text, message.files);
        if (message.files.length > 0) {
          this.filesLoading$.next(true);
          return message$.pipe(onMessageOrFailed(() => this.filesLoading$.next(false)));
        }
        return message$;
      }),
    );

    /** Marks messages as read on user events (e.g. scroll). @see getOnScrollSideEffect */
    const markMessageReadOnScroll$ = this.getOnScrollSideEffect(messagesContainer$);

    /** Attaches lazy loader class to messages container so that it would handle the messages loading on scroll. */
    const attachLazyLoader$ = messagesContainer$.pipe(
      tap(container => this.lazyLoader.attachTo(container)),
      take(1),
    );

    /** Catches initial rendering of chat and loads the page with last read message. */
    const scrollToLastReadOnChatOpening$ = this.chat$.pipe(
      filter(chat => chat != null),
      distinctUntilKeyChanged('id'),
      switchMap(chat => chatElementsChange$.pipe(
        take(1),
        map((messages: ChatMessageComponent[]) =>
          messages.find(
            ({ message }) => message.id === chat.lastReadMessageId)),
        tap(messageToScrollTo => messageToScrollTo && messageToScrollTo.scrollIntoView()),
      )),
    );

    /**
     * Request the last page of messages when user sent a new message to the chat,
     *  while not having the last page loaded.
     */
    const requestLastPageAfterSentMessage$ = sentMessageWhileNotLoadedLastPage$.pipe(
      tap(() => this.lastPageRequested$.next()),
    );

    // Merge all the events that require scroll at the bottom of the chat
    const scrollToEndOnNewMessage$ = merge(
      newMessageAtEnd$,
      messageSentByUser$,
      gotLastPage$,
    ).pipe(
      switchMapTo(this.scrollToTheEndOfChat()),
    );

    // Subscribe for all the async side effects of chat window
    merge(
      attachLazyLoader$,
      scrollToLastReadOnChatOpening$,
      scrollToEndOnNewMessage$,
      markMessageReadOnScroll$,
      sendNewMessage$,
      requestLastPageAfterSentMessage$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private getOnScrollSideEffect(messagesContainer$: Observable<HTMLElement>): Observable<void> {

    const containerScroll$ = messagesContainer$.pipe(
      switchMap(container => fromEvent(container, 'scroll')),
    );

    const mouseMove$ = fromEvent(document, 'mousemove');

    return merge(
      containerScroll$,
      mouseMove$,
    ).pipe(
      throttleTime(3000),
      switchMapTo(messagesContainer$),
      withLatestFrom(this.chatMessages.changes as Observable<QueryList<ChatMessageComponent>>, this.chat$),
      switchMap(([container, messagesQueryList, chat]) => {
        const messages = messagesQueryList.toArray();
        if (!messages.length || chat.countUnreadMessages === 0) {
          // Don't mark any messages when chat is empty or the last message is already read
          return NEVER;
        }
        // Find the last message that is on viewport
        const viewportStart = container.scrollTop;
        const viewportEnd = viewportStart + container.clientHeight;

        const lastReadIdx = messages.findIndex(m => m.message.id === chat.lastReadMessageId);
        const unreadMessageOnViewport = messages
          .slice(lastReadIdx + 1) // Slice unread
          .reverse() // ... starting from the end
          .find(({ offsetTop }) => // ... find the first message that is within the viewport
            viewportStart < offsetTop && viewportEnd > offsetTop);

        return unreadMessageOnViewport ?
          this.chatService.setLastReadMessage(chat, unreadMessageOnViewport.message)
          : NEVER;
      }),
    );
  }

  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.lazyLoader.detach();
  }

  /**
   * Send text message on submit.
   * @param messageText Message text.
   */
  public onNewMessageFormSubmitted(messageText: string): void {
    // Reset attached files.
    const files = this.attachedFiles;
    this.attachedFiles = [];

    this.newMessage$.next({
      files,
      text: messageText,
    });
  }

  private scrollToTheEndOfChat(): Observable<void> {
    return this.messagesContainer$.pipe(
      tap(({ nativeElement }) => nativeElement.scrollTo({
        top: nativeElement.scrollHeight,
      })),
      mapTo(null),
    );
  }

  /**
   * Load last page of messages.
   */
  public loadLastPage(): void {
    this.lastPageRequested$.next();
  }

  /**
   * Attach files to next message.
   */
  public onFileAttached(files: File[]): void {
    this.attachedFiles = files;
    this.onNewMessageFormSubmitted(null);
  }

  /**
   * Checks whether the daystamp between messages should be displayed.
   * @param messages Messages.
   * @param i Current idx.
   */
  public shouldDisplayDaystamp(this: void, messages: Message[], i: number): boolean {
    if (i === 0) {
      // Show daystamp at the beginning of a chat
      return true;
    }

    // If messages are created on different days - we want to show a daystamp in between
    const prevMessageDate = messages[i - 1].created;
    const currMessageDate = messages[i].created;
    const shouldDisplayTimestamp = JusLawDateUtils.areDatesDifferent(
      prevMessageDate, currMessageDate);

    return shouldDisplayTimestamp;
  }

  /** Compare message authors. */
  public isMessageAuthorsEqual(message1: Message, message2: Message): boolean {
    const author1 = message1 && message1.author;
    const author2 = message2 && message2.author;
    return (author1 && author1.id) === (author2 && author2.id);
  }

  private initMessagesStream(): Observable<Message[]> {
    const items$ = this.lazyLoader.items$.pipe(
      map(pages =>
        pages && pages.reduce((acc, { items }) =>
          acc.concat(items), [] as Message[])),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    // Concatenation of static pagination and hot list of new messages
    const paginatedWithHotTail$ = items$.pipe(
      withLatestFrom(this.chat$),
      switchMap(([messages, chat]) => {
        // If pagination is being reset, the array of messages is null
        if (messages == null) {
          return of(null);
        }
        // If the chat is empty, we want to get hot messages observable
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        return this.chatService.getHotMessages(chat, lastMessage).pipe(
          map(lastMessages => messages.concat(lastMessages)),
        );
      }),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    // Check whether the pagination is ended at the bottom and we need to concat it with the new messages
    const shouldLoadHotTail$ = this.lazyLoader.haveMoreNext$.pipe(
      map(haveMoreAtBottom => !haveMoreAtBottom),
      filter(bottomReached => bottomReached),
      take(1),
      startWith(false),
    );

    return items$.pipe(
      switchMapTo(shouldLoadHotTail$.pipe(
        switchMap(shouldLoadTail =>
          shouldLoadTail ? paginatedWithHotTail$ : items$),
      )),
    );
  }
}
