export default interface ProfileSummary {
  lastModified: string;
  shows: ShowBackupInfo[];
}

export interface ShowBackupInfo {
  name: string;
  songNames: string[];
  noOfRehearsals: number;
}
