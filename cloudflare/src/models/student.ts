export interface ParsedStudent {
  id: string;
  name: string;
  main: string;
  castings: string;
  lesson: string;
}
export interface Student extends ParsedStudent {
  show_id: string;
}
