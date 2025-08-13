export interface Rehearsal {
  id: string;
  date: string;
  absent: string;
  were_run: string;
  todo_list: string;
  show_id: string;
}

export interface ParsedRehearsal {
  id: string;
  date: string;
  absent: string;
  wereRun: string;
  todoList: string;
}

export interface ParsedShowRehearsal extends ParsedRehearsal {
  showID: string;
}
