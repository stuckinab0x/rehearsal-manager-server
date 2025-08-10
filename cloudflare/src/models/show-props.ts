export interface ShowProps {
  id: string;
  name: string;
  single_artist: number;
  two_pm_rehearsal: number;
  set_split_index: number;
}

export interface ParsedShowProps {
  id: string;
  name: string;
  singleArtist: boolean;
  twoPMRehearsal: boolean;
  setSplitIndex: number;
}
