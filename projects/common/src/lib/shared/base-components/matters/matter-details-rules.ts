import { MatterStatus } from '@jl/common/core/models/matter-status';
import { Role } from '@jl/common/core/models/role';

/** Matter UI elements that User is able to edit. */
export enum MatterDetailPermissions {
  /** Edit notes. */
  EditNotes,
  /** Edit stage. */
  EditStage,
  /** Edit files. */
  EditFiles,
  /** Edit folders. */
  EditFolders,
  /** Edit jobs. */
  EditJobs,
  /** Close matter. */
  CloseMatter,
  /** Send message. */
  SendPersonalMessage,
  /** Call. */
  InitiateCall,
  /** Edit matter info. */
  EditMatterInfo,
  /** Revoke matter. */
  RevokeMatter,
  /** Reopen matter. */
  ReopenMatter,
  /** Upload docs to docusign. */
  DocusignUpload,
  /** Record voice consent. */
  RecordVoiceConsent,
  /** Edit voice consent. */
  EditConsents,
  /** Refer matter */
  ReferMatter,
  /** Add support to matter. */
  AddSupports,
}

/** Unauthorized user has no access to the page, so exclude the role. */
type EditableElement = Record<Exclude<Role, Role.Unauthorized>, MatterDetailPermissions[]>;

/**
 * Rules for editing matter data.
 *
 * Since we have complex logic for editing the data on matter-details page,
 *  I thought it would be easier to understand the logic with rules object.
 *
 * For every status and role there is a set of elements that user is able to edit.
 */
export const MATTER_DETAILS_RULES: Record<MatterStatus, EditableElement> = {
  [MatterStatus.Active]: {
    [Role.Attorney]: [
      MatterDetailPermissions.EditFiles,
      MatterDetailPermissions.EditFolders,
      MatterDetailPermissions.EditJobs,
      MatterDetailPermissions.EditNotes,
      MatterDetailPermissions.EditStage,
      MatterDetailPermissions.CloseMatter,
      MatterDetailPermissions.SendPersonalMessage,
      MatterDetailPermissions.InitiateCall,
      MatterDetailPermissions.RevokeMatter,
      MatterDetailPermissions.DocusignUpload,
      MatterDetailPermissions.ReferMatter,
      MatterDetailPermissions.AddSupports,
      MatterDetailPermissions.EditConsents,
    ],
    [Role.Client]: [
      MatterDetailPermissions.EditFiles,
      MatterDetailPermissions.EditNotes,
      MatterDetailPermissions.SendPersonalMessage,
      MatterDetailPermissions.InitiateCall,
      MatterDetailPermissions.RecordVoiceConsent,
    ],
    [Role.Staff]: [
      MatterDetailPermissions.InitiateCall,
      MatterDetailPermissions.EditFiles,
      MatterDetailPermissions.EditFolders,
      MatterDetailPermissions.EditJobs,
      MatterDetailPermissions.EditNotes,
      MatterDetailPermissions.EditStage,
      MatterDetailPermissions.CloseMatter,
      MatterDetailPermissions.SendPersonalMessage,
      MatterDetailPermissions.EditConsents,
    ],
  },
  [MatterStatus.Revoked]: {
    [Role.Attorney]: [
      MatterDetailPermissions.ReopenMatter,
    ],
    [Role.Client]: [],
    [Role.Staff]: [],
  },
  [MatterStatus.Completed]: {
    [Role.Attorney]: [],
    [Role.Client]: [],
    [Role.Staff]: [],
  },
  [MatterStatus.Pending]: {
    [Role.Attorney]: [
      MatterDetailPermissions.EditMatterInfo,
      MatterDetailPermissions.RevokeMatter,
    ],
    [Role.Client]: [],
    [Role.Staff]: [],
  },
  [MatterStatus.Draft]: {
    [Role.Attorney]: [
      MatterDetailPermissions.EditMatterInfo,
      MatterDetailPermissions.RevokeMatter,
    ],
    [Role.Client]: [],
    [Role.Staff]: [],
  },
};

/**
 * List of permissions that are not allowed for users with shared matter.
 */
export const RESTRICTED_FOR_SHARED_MATTER: MatterDetailPermissions[] = [
  // Add restricted permissions here
  MatterDetailPermissions.InitiateCall,
];
