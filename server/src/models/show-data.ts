export interface ShowData {
  name: string;
  singleArtist: boolean;
  twoPmRehearsal: boolean;
  setSplitIndex: boolean;
  songs: Song[];
  cast: CastMember[];
}

export default interface Show extends ShowData {
  rehearsals: Rehearsal[];
}

interface Song {
  name: string;
  artist?: string;
  order: number;
}

interface Casting {
  songName: string;
  inst: string;
}

interface CastMember {
  name: string;
  main: string;
  castings: Casting[]
  lesson: string;
}

export interface Rehearsal {
  date: string;
  absent: Absence[];
  wereRun: string[];
  todoList: string[];
}

interface Absence {
  studentName: string;
  status: string;
}
