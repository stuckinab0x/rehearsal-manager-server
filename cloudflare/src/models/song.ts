export interface Song {
  id: string;
  name: string;
  artist?: string;
  set_order: number;
  color: string;
  show_id: string;
}

export interface ParsedSong {
  id: string;
  name: string;
  artist?: string;
  setOrder: number;
  color: string;
}
