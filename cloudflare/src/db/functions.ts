import ProfileSummary from '../models/profile-summary';
import { ParsedRehearsal } from '../models/rehearsal';

export const setRehearsals = async (db: D1Database, rehearsals: ParsedRehearsal[], showID: number) => {
  const rehearsalStatements = rehearsals.map(x => 
    db.prepare(
      `
        INSERT INTO rehearsals (date, absent, were_run, todolist, show_id)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT (date) DO UPDATE SET
          date = ?1,
          absent = ?2,
          were_run = ?3,
          todolist = ?4,
          show_id = ?5
          WHERE date = ?1;
      `
    ).bind(x.date, JSON.stringify(x.absent), JSON.stringify(x.wereRun), JSON.stringify(x.todoList), showID)
  )

  await db.batch(rehearsalStatements);
}
