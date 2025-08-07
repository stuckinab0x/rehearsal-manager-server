import Student from './student';
import Song from './song';

export interface ShowProps {
  id: number;
  name: string;
  singleArtist: boolean;
  twoPMRehearsal: boolean;
  setSplitIndex: number;
}

export default interface Show extends ShowProps {
  songs: Song[];
  cast: Student[];
}
