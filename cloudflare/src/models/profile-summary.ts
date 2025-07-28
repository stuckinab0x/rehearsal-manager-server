export default interface ProfileSummary {
  profileName: string;
  lastModified: Date;
  shows: ShowBackupInfo[];
}

export interface ShowBackupInfo {
  name: string;
  songNames: string[];
  noOfRehearsals: number;
}
