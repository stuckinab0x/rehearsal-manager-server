export interface ShowData {
  id: number;
  name: string;
  singleArtist: boolean;
  twoPmRehearsal: boolean;
  setSplitIndex: number;
  songs: Song[];
  cast: Student[];
}

export interface ShowNameAndId {
  id: string;
  name: string;
}

export default interface Show extends ShowData {
  rehearsals: Rehearsal[];
}

export interface Song {
  id: number;
  name: string;
  artist?: string;
  color: string;
}

interface Casting {
  songName: string;
  inst: string;
}

export interface Student {
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
