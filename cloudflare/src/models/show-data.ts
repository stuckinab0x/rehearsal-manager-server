export interface ShowData {
  id: string;
  name: string;
  singleArtist: boolean;
  twoPmRehearsal: boolean;
  setSplitIndex: number;
  songs: Song[];
  cast: CastMember[];
}

export interface ShowNameAndId {
  id: string;
  name: string;
}

export default interface Show extends ShowData {
  rehearsals: Rehearsal[];
}

interface Song {
  id: string;
  name: string;
  artist?: string;
  color: string;
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
