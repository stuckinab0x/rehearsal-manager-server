export interface Rehearsal {
  id: string;
  date: string;
  absent: string;
  were_run: string;
  todo_list: string;
}

export interface ParsedRehearsal {
  id: string;
  date: string;
  absent: string;
  wereRun: string;
  todoList: string;
}
