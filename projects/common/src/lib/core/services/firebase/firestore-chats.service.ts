import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { Observable, of, forkJoin, from, EMPTY } from 'rxjs';
import { map, switchMap, mapTo, first, shareReplay, catchError, take, filter, startWith } from 'rxjs/operators';

import { FirebaseService } from './firebase.service';
import { FirestoreChatFields } from './models/firestore-chat';
import { FirestoreChatMessage, firestoreChatMessageDateToNumber } from './models/firestore-chat-message';
import { FirestoreChatMessageTypes } from './models/firestore-message-type';
import { FirestoreUser, FirestoreUserFields, FirestoreUserChatFields, FirestoreUserChat } from './models/firestore-user';

/** Directio */
enum LoadingDirection {
  /** Descending order of selected field to be able to load previous messages. */
  ToStart = 'desc',
  /** Load messages to top. */
  ToEnd = 'asc',
}

const CHATS_COLLECTION_NAME = 'chats';
const CHAT_MESSAGES_COLLECTION_NAME = 'messages';
const USERS_COLLECTION_NAME = 'users';
const USER_CHATS_INFO_COLLECTION_NAME = 'chats';

/**
 * Firestore chat service.
 * Provides methods to work with chats based on Firestore.
 */
@Injectable({
  providedIn: 'root',
})
export class FirestoreChatsService {
  /** Current user chats. */
  public readonly currentUserChats$: Observable<FirestoreUserChat[]>;

  private readonly usersCollection: AngularFirestoreCollection<FirestoreUserFields>;
  private readonly chatsCollection: AngularFirestoreCollection<FirestoreChatFields>;
  private readonly currentFirestoreUser$: Observable<FirestoreUser>;

  /**
   * @constructor
   * @param angularFireAuth Angular Firebase Authentication service.
   * @param angularFirestore Angular Firestore service.
   */
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly angularFirestore: AngularFirestore,
  ) {
    this.usersCollection = this.angularFirestore.collection<FirestoreUserFields>(USERS_COLLECTION_NAME);
    this.chatsCollection = this.angularFirestore.collection<FirestoreChatFields>(CHATS_COLLECTION_NAME);
    this.currentFirestoreUser$ = this.createCurrentFirestoreUserStream();
    this.currentUserChats$ = this.getCurrentUserChats();
  }

  /**
   * Obtain list of messages after specified one.
   * @param chatId Chat id.
   * @param limit Limit of messages.
   * @param startAt Message to start from.
   */
  public getMessagesAfterAnother(
    chatId: string,
    limit: number,
    startAt: FirestoreChatMessage,
  ): Observable<FirestoreChatMessage[]> {
    return this.getMessagesPage(
      chatId, LoadingDirection.ToEnd, limit, startAt,
    );
  }

  /**
   * Obtain list of messages before specified one.
   * @param chatId Chat id.
   * @param limit Limit.
   * @param startAt Message to start from.
   */
  public getMessagesBeforeAnother(
    chatId: string,
    limit: number,
    startAt: FirestoreChatMessage,
  ): Observable<FirestoreChatMessage[]> {
    return this.getMessagesPage(
      chatId, LoadingDirection.ToStart, limit, startAt,
    ).pipe(
      map(messages => messages.reverse()),
    );
  }

  /**
   * Obtain list of message from the very start of messages history.
   * @param chatId Chat id.
   * @param limit Limit.
   */
  public getMessagesFromStart(
    chatId: string, limit: number,
  ): Observable<FirestoreChatMessage[]> {
    return this.getMessagesPage(
      chatId, LoadingDirection.ToEnd, limit,
    );
  }

  /**
   * Get `limit` of messages from the end of pagination.
   * @param chatId Chat id.
   * @param limit Limit of messages.
   */
  public getMessagesFromEnd(
    chatId: string, limit: number,
  ): Observable<FirestoreChatMessage[]> {
    return this.getMessagesPage(
      chatId, LoadingDirection.ToStart, limit,
    ).pipe(
      map(messages => messages.reverse()),
    );
  }

  /**
   * Get page of messages on which last read message is presented.
   * @param chatId Chat id.
   * @param limit Limit of messages.
   */
  public getMessagesPageWithLastRead(
    chatId: string,
    limit: number,
  ): Observable<FirestoreChatMessage[]> {
    /**
     * If starting message is not provided,
     *  load the page with last read message in the middle.
     */
    const halfLimit = Math.floor(limit / 2);
    const lastRead$ = this.obtainLastReadMessage(chatId);
    return lastRead$.pipe(
      switchMap(lastRead => forkJoin([
        this.getMessagesBeforeAnother(chatId, halfLimit, lastRead),
        of([lastRead]),
        this.getMessagesAfterAnother(chatId, halfLimit, lastRead),
      ])),
      take(1),
      map(chunks => chunks.reduce((acc, chunk) => acc.concat(chunk), [])),
    );
  }

  /**
   * Get hot observable of messages.
   * @param chatId Chat id.
   * @param message Message to start from.
   */
  public getHotMessages(chatId: string, message?: FirestoreChatMessage): Observable<FirestoreChatMessage[]> {
    return this.chatsCollection.doc<FirestoreChatMessage>(chatId)
      .collection(
        CHAT_MESSAGES_COLLECTION_NAME,
        this.getMessagesQuery(LoadingDirection.ToEnd, null, message),
      ).valueChanges({ idField: 'id' }) as Observable<FirestoreChatMessage[]>;
  }

  /**
   * Add a text post to the specific chat.
   * @param chatId Chat ID.
   * @param message Firestore message.
   */
  public addMessageToChat(
    chatId: string,
    message: FirestoreChatMessage,
  ): Observable<void> {
    return this.currentFirestoreUser$
      .pipe(
        switchMap(currentFirestoreUser => {
          const chatDoc = this.chatsCollection.doc<FirestoreChatFields>(chatId);
          // Copy and adjust properties.
          const firestoreMessage: FirestoreChatMessage = {
            ...message,
            created: firestore.FieldValue.serverTimestamp(),
          };
          if (firestoreMessage.id == null) {
            // Clear id if it is undefined to avoid problems with parsing message object in AngularFirestoreCollection.add
            delete firestoreMessage.id;
          }
          return from(chatDoc
            .collection<FirestoreChatMessage>(CHAT_MESSAGES_COLLECTION_NAME)
            .add(firestoreMessage),
          )
            .pipe(
              // Use newMessageSnapshot.data() instead of firestoreMessage because of `serverTimestamp`.
              // We need exact time for statistics.
              switchMap(messageDocRef => messageDocRef.get()),
              map(messageDoc => ({ ...messageDoc.data(), id: messageDoc.id }) as FirestoreChatMessage),
              // Set new message as last read for the author.
              switchMap(newMessageSnapshot => {
                // Set last read message for current user (sender) and return snapshot data of new message to update statistics from it.
                return from(this.updateLastReadMessageForUser(
                  currentFirestoreUser.id,
                  chatId,
                  newMessageSnapshot,
                )).pipe(
                  mapTo(newMessageSnapshot),
                );
              }),
              switchMap(newMessage => {
                return chatDoc.get()
                  .pipe(
                    map(chatDocSnapshot => chatDocSnapshot.data() as FirestoreChatFields),
                    switchMap(chat => {
                      // Update statistics for participants.
                      const requests = chat.participants.map(participantId =>
                        this.updateUserChatMessagesStatistics(participantId.toString(), chatId, newMessage));
                      return forkJoin(requests);
                    }),
                  );
              }),
            );
        }),
        mapTo(null),
        first(),
      );
  }

  /**
   * Set last read message for current user in specific chat and update statistics.
   * @param chatId Chat ID.
   * @param messageId Message ID.
   */
  public setLastReadMessageForCurrentUser(chatId: string, message: FirestoreChatMessage): Observable<void> {
    return this.currentFirestoreUser$.pipe(
      first(),
      switchMap(user =>
        this.updateLastReadMessageForUser(user.id, chatId, message)),
      take(1),
    );
  }

  private obtainLastReadMessage(chatId: string): Observable<FirestoreChatMessage | null> {
    return this.currentUserChats$.pipe(
      map(chats => chats.find((c) => c.chatId === chatId)),
      switchMap(({ last_read_post }) => {
        if (last_read_post == null) {
          return of(null);
        }
        return this.getMessageById(chatId, last_read_post);
      }),
      take(1),
    );
  }

  private getMessageById(chatId: string, id: string): Observable<FirestoreChatMessage> {
    return this.chatsCollection.doc<FirestoreChatMessage>(chatId)
      .collection(CHAT_MESSAGES_COLLECTION_NAME)
      .doc(id).get().pipe(
        map(this.mapQuerySnapshotToMessage),
      );
  }

  private mapQuerySnapshotToMessage(
    this: void,
    querySnapshot: firestore.DocumentSnapshot,
  ): FirestoreChatMessage {
    return {
      ...querySnapshot.data() as FirestoreChatMessage,
      id: querySnapshot.id,
    };
  }

  private getMessagesQuery(
    direction: LoadingDirection,
    limit?: number,
    messageToStartFrom?: FirestoreChatMessage,
  ): (ref: CollectionReference) => firestore.Query {
    const orderByField = 'created';
    return (ref) => {
      let query = ref.orderBy(orderByField, direction);
      if (limit) {
        query = query.limit(limit);
      }
      if (messageToStartFrom) {
        query = query.startAfter(messageToStartFrom[orderByField]);
      }
      return query;
    };
  }

  private updateLastReadMessageForUser(firestoreUserId: string, chatId: string, message: FirestoreChatMessage): Promise<void> {
    return this.usersCollection.doc<FirestoreUserFields>(firestoreUserId)
      .collection(USER_CHATS_INFO_COLLECTION_NAME)
      .doc<FirestoreUserChatFields>(chatId)
      .update({
        last_read_post: message.id,
      })
      .then(() => this.updateUserChatMessagesStatistics(firestoreUserId, chatId, message));

  }

  /**
   * Update user chat statistics.
   * @param firestoreUserId Firestore user ID.
   * @param chatId Chat ID.
   * @param lastMessage Last chat message to update after add new message.
   */
  private updateUserChatMessagesStatistics(
    firestoreUserId: string, chatId: string, lastMessage?: FirestoreChatMessage): Promise<void> {
    const currentStatisticDoc = this.usersCollection.doc<FirestoreUserFields>(firestoreUserId)
      .collection(USER_CHATS_INFO_COLLECTION_NAME)
      .doc<FirestoreUserChatFields>(chatId);

    const currentStatistic$ = currentStatisticDoc
      .get()
      .pipe(
        map(docSnapshot => docSnapshot.data() as FirestoreUserChatFields),
      );

    // Prepare update.
    const statisticsUpdate: Partial<FirestoreUserChatFields> = {};
    if (lastMessage != null) {
      statisticsUpdate.last_chat_message_text = FirestoreChatMessageTypes.getMessagePreviewText(lastMessage);
      statisticsUpdate.last_chat_message_date = firestoreChatMessageDateToNumber(lastMessage.created).valueOf();
    }

    return currentStatistic$
      .pipe(
        filter(currentStatistic =>
          currentStatistic.last_chat_message_date <= statisticsUpdate.last_chat_message_date),
        switchMap(chatStatistic => {
          if (chatStatistic.last_read_post == null) {
            return of(null);
          }
          // Get last read message doc.
          return this.chatsCollection.doc(chatId)
            .collection(CHAT_MESSAGES_COLLECTION_NAME)
            .doc(chatStatistic.last_read_post)
            .get();
        }),
        switchMap(lastReadMessageSnapshot => {
          if (lastReadMessageSnapshot == null) {
            return this.chatsCollection.doc(chatId)
              .collection(CHAT_MESSAGES_COLLECTION_NAME)
              .get();
          }
          const lastReadMessageDateCreated = lastReadMessageSnapshot.data().created;
          // Get messages that older that a last read.
          return this.chatsCollection.doc(chatId)
            .collection(
              CHAT_MESSAGES_COLLECTION_NAME,
              ref => ref
                .where('created', '>', lastReadMessageDateCreated)
                .startAfter(lastReadMessageSnapshot),
            )
            .get();
        }),
        switchMap(newMessagesQuerySnapshot => {
          statisticsUpdate.count_unread = newMessagesQuerySnapshot.size;
          return currentStatisticDoc.update(statisticsUpdate);
        }),
      )
      .toPromise();
  }

  private getCurrentUserChats(): Observable<FirestoreUserChat[]> {
    const userChatsInfoChange$ = this.currentFirestoreUser$
      .pipe(
        switchMap(currentFirestoreUser =>
          this.getChatsStreamForUser(currentFirestoreUser),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
      );
    return userChatsInfoChange$;
  }

  private getChatsStreamForUser(user: FirestoreUser): Observable<FirestoreUserChat[]> {
    const userChatsCollection = this.usersCollection.doc<FirestoreUserFields>(user.id)
      .collection<FirestoreUserChatFields>(USER_CHATS_INFO_COLLECTION_NAME);
    return userChatsCollection.valueChanges({ idField: 'chatId' });
  }

  private createCurrentFirestoreUserStream(): Observable<FirestoreUser> {
    return this.firebaseService.firebaseUser$
      .pipe(
        switchMap(firebaseUser => {
          return this.usersCollection.doc<FirestoreUserFields>(firebaseUser.uid).valueChanges()
            .pipe(
              map(firestoreUserPayload => {
                return {
                  ...firestoreUserPayload,
                  id: firebaseUser.uid,
                };
              }),
            );
        }),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
      );
  }

  private getMessagesPage(
    chatId: string,
    direction: LoadingDirection,
    limit: number,
    startFrom?: FirestoreChatMessage,
  ): Observable<FirestoreChatMessage[]> {
    const chatDoc = this.chatsCollection.doc<FirestoreChatMessage>(chatId);
    return chatDoc.collection(
      CHAT_MESSAGES_COLLECTION_NAME,
      this.getMessagesQuery(direction, limit, startFrom),
    ).get().pipe(
      map(doc => doc.docs.map(this.mapQuerySnapshotToMessage)),
      take(1),
    );
  }
}
