import { AttorneyRegistration } from '@jl/common/core/models/attorney-registration';

export const INITIAL_ATTORNEY_REGISTRATION_DATA = new AttorneyRegistration({
  email: '',
  password: '',
  passwordRepeat: '',
  education: null,
  isDisciplined: false,
  practiceDescription: null,
  firmLocation: null,
  firmLocationData: null,
  firmLocationCity: null,
  firmLocationState: null,
  yearsOfExperience: null,
  haveSpecialty: false,
  specialties: [],
  specialtyTime: null,
  specialtyMattersCount: null,
  keywords: '',
  feeRate: null,
  charityOrganizations: null,
  extraInfo: null,
  avatar: '',
  feeKinds: [],
  practiceJurisdictions: [],
  licenseInfo: '',
  attachedFiles: [],
});

// tslint:disable-next-line: max-line-length
export const ATTORNEY_ACCOUNT_CREATED_MESSAGE = 'Attorney verification may take a few days. Once verified, you will have access to additional features exclusively for attorneys on Jus-Law.';
// tslint:disable-next-line: max-line-length
export const STAFF_ACCOUNT_CREATED_MESSAGE = 'Paralegal verification may take a few days. Once verified, you will have access to JusLaw features.';
export const ACCOUNT_CREATED_TITLE = 'Account Created!';
