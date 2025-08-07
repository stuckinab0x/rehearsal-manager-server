export interface Show {
  id: number;
  name: string;
  single_artist: number;
  two_pm_rehearsal: number;
  set_split_index: number;
}

export interface Song {
  id: number;
  name: string;
  artist?: string;
  color: string;
}

export interface Student {
  id: number;
  name: string;
  main: string;
  castings: string;
  lesson: string;
}

export interface Rehearsal {
  id: number;
  date: string;
  absent: string;
  were_run: string;
  todo_list: string;
}
