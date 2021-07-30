import { Attorney } from './attorney';
import { City } from './city';
import { Client } from './client';
import { Country } from './country';
import { ESignEnvelop } from './esign-envelop';
import { JusLawFile } from './juslaw-file';
import { Lead } from './lead';
import { MatterStatus } from './matter-status';
import { Stage } from './stage';
import { State } from './state';
import { User } from './user';

/** Matter model. */
export class Matter {
  /** Id */
  public id: number;
  /** Lead data */
  public lead: Lead;
  /** Client data */
  public client: Client;
  /** Attorney data */
  public attorney: Attorney;
  /** Code */
  public code: string;
  /** Title */
  public title: string;
  /** Description */
  public description: string;
  /** Rate type */
  public rateType: 'hourly' | 'fixed_amount' | 'contingency_fee' | 'alternative';
  /** Rate */
  public rate: string;
  /** Country data */
  public country: Country;
  /** State data */
  public state: State;
  /** City */
  public city: City;
  /** Status */
  public status: MatterStatus;
  /** Phase */
  public stage: Stage;
  /** Chat channel */
  public chatChannel: string;
  /** Created */
  public created: Date;
  /** Modified */
  public modified: string;
  /** Billable time. */
  public timeBilled: number;
  /** Fees earned */
  public earned: number;
  /** URLs to Esign document. */
  public documents: JusLawFile[] = [];
  /** Date of completion. */
  public completed: Date;
  /** E-sign envelop of documents. */
  public eSignEnvelop?: ESignEnvelop = null;
  /** List of attorneys the matter is shared with. */
  public sharedWith: User[];
  /**
   * Is the matter shared with the current user.
   * This flag has to be 'false' if the current user is a matter's owner.
   */
  public isSharedWithCurrentUser: boolean;

  /**
   * @constructor
   * @param matter
   */
  public constructor(matter: Partial<Matter>) {
    this.id = matter.id;
    this.lead = matter.lead;
    this.client = matter.client;
    this.attorney = matter.attorney;
    this.code = matter.code;
    this.title = matter.title;
    this.description = matter.description;
    this.rateType = matter.rateType;
    this.rate = matter.rate;
    this.country = matter.country;
    this.state = matter.state;
    this.city = matter.city;
    this.status = matter.status;
    this.stage = matter.stage;
    this.chatChannel = matter.chatChannel;
    this.created = matter.created;
    this.modified = matter.modified;
    this.earned = matter.earned;
    this.timeBilled = matter.timeBilled;
    this.documents = matter.documents || [];
    this.completed = matter.completed;
    this.eSignEnvelop = matter.eSignEnvelop || null;
    this.sharedWith = matter.sharedWith || [];
    this.isSharedWithCurrentUser = matter.isSharedWithCurrentUser;
  }

  /** Is matter completed. */
  public get isCompleted(): boolean {
    return this.status === MatterStatus.Completed;
  }
}
