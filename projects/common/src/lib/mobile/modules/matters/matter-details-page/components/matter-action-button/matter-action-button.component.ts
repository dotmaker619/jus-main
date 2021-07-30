import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { Matter } from '@jl/common/core/models';
import { MatterDetailPermissions } from '@jl/common/shared/base-components/matters/matter-details-rules';

interface ButtonOption {
  /** Button label. */
  text: string;
  /** Button click handler. */
  handler?: () => void;
  /** Button role. */
  role?: string;
}

type MatterActionSheetOptions = keyof Pick<
  keyof MatterDetailPermissions,
  MatterDetailPermissions.EditFolders |
  MatterDetailPermissions.CloseMatter |
  MatterDetailPermissions.RevokeMatter |
  MatterDetailPermissions.ReopenMatter |
  MatterDetailPermissions.EditMatterInfo |
  MatterDetailPermissions.EditNotes |
  MatterDetailPermissions.EditFiles |
  MatterDetailPermissions.RecordVoiceConsent |
  MatterDetailPermissions.ReferMatter |
  MatterDetailPermissions.AddSupports
>;

/** Matter action button. */
@Component({
  selector: 'jlc-matter-action-button',
  templateUrl: './matter-action-button.component.html',
  styleUrls: ['./matter-action-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatterActionButtonComponent {
  /** Matter actions map. */
  public readonly actionMap: Record<MatterActionSheetOptions, ButtonOption> = {
    [MatterDetailPermissions.EditFolders]: {
      text: 'Add a Folder',
      handler: () => this.addFolder.next(),
    },
    [MatterDetailPermissions.CloseMatter]: {
      text: 'Close Matter',
      handler: () => this.closeMatter.next(),
    },
    [MatterDetailPermissions.RevokeMatter]: {
      text: 'Revoke Matter',
      handler: () => this.revokeMatter.next(),
      role: 'destructive',
    },
    [MatterDetailPermissions.ReopenMatter]: {
      text: 'Re-open Matter',
      handler: () => this.reopenMatter.next(),
    },
    [MatterDetailPermissions.EditMatterInfo]: {
      text: 'Edit Matter',
      handler: () => this.router.navigate(['matters', this.matter.id, 'edit']),
    },
    [MatterDetailPermissions.EditNotes]: {
      text: 'Add a Note',
      handler: () => this.addNote.next(),
    },
    [MatterDetailPermissions.EditFiles]: {
      text: 'Upload a File',
      handler: () => this.uploadFile.next(),
    },
    [MatterDetailPermissions.RecordVoiceConsent]: {
      text: 'Record a Consent',
      handler: () => this.recordConsent.next(),
    },
    [MatterDetailPermissions.ReferMatter]: {
      text: 'Refer Matter',
      handler: () => this.referMatter.emit(),
    },
    [MatterDetailPermissions.AddSupports]: {
      text: '+ Paralegal',
      handler: () => this.addSupports.emit(),
    },
  };

  /** Matter to perform the action with. */
  @Input()
  public matter: Matter;

  /** Matter permissions. */
  @Input()
  public permissions: MatterDetailPermissions[] = [];

  /** Revoke matter event. */
  @Output()
  public readonly revokeMatter = new EventEmitter<void>();

  /** Close matter event. */
  @Output()
  public readonly closeMatter = new EventEmitter<void>();

  /** Add note event. */
  @Output()
  public readonly addNote = new EventEmitter<void>();

  /** Upload file clicked. */
  @Output()
  public readonly uploadFile = new EventEmitter<void>();

  /** Add folder clicked. */
  @Output()
  public readonly addFolder = new EventEmitter<void>();

  /** Reopen matter event. */
  @Output()
  public readonly reopenMatter = new EventEmitter<void>();

  /** Record voice consent. */
  @Output()
  public readonly recordConsent = new EventEmitter<void>();

  /** Refer matter */
  @Output()
  public readonly referMatter = new EventEmitter<void>();

  /** Add supports to matter */
  @Output()
  public readonly addSupports = new EventEmitter<void>();

  /** Is action button visible. */
  public get isButtonVisible(): boolean {
    const availableActions = Object.keys(this.actionMap);

    // Check if at least one of passed actions is available to select in actionMap.
    return this.permissions.some(p => availableActions.includes(p.toString()));
  }

  /**
   * @constructor
   * @param actionSheetController Actionsheet controller.
   * @param router Router.
   */
  public constructor(
    private readonly actionSheetController: ActionSheetController,
    private readonly router: Router,
  ) { }

  /**
   * Open actionsheet for the matter.
   */
  public async onMoreButtonClick(): Promise<void> {
    const defaultActions = [
      {
        text: 'Cancel',
        role: 'cancel',
      },
    ];
    const actionSheet = await this.actionSheetController.create({
      buttons: this.permissions
        .filter(permission => permission in this.actionMap)
        .map(permission => this.actionMap[permission])
        .concat(defaultActions),
    });
    actionSheet.present();
  }
}
