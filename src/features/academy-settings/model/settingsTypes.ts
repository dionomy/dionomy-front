export type AcademySettings = {
  name: string;
  contact: string;
  address: string;
  logoUrl: string | null;
  mainColor: string;
  extensionAllowed: boolean;
  refundAllowed: boolean;
  makeupEnabled: boolean;
  makeupExpiresInDays: number;
  makeupMaxCount: number;
};
