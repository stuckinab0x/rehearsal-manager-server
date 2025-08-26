import { Rehearsal, ParsedRehearsal, ParsedShowRehearsal } from '../models/rehearsal';

export default async function handleRehearsalsRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  const routePath = url.pathname.split('/api/rehearsals')[1];

  const profileID = url.searchParams.get('profileID');
  const showID = url.searchParams.get('showID');

  if (routePath === '' && req.method === 'GET' && showID) {
    const rehearsalsResult = await db.prepare(
      "SELECT id, date, absent, were_run, todolist FROM rehearsals WHERE show_id = ?",
    ).bind(showID).run<Rehearsal>();
    const rehearsals = rehearsalsResult.results.map<ParsedRehearsal>(x => ({
      id: x.id, date: x.date, absent: JSON.parse(x.absent), wereRun: JSON.parse(x.were_run), todoList: JSON.parse(x.todo_list),
    }));
    return Response.json(rehearsals);
  }

  // app

  if (routePath === '/full' && req.method === 'GET' && profileID) {
    const showIDsResult = await db.prepare(
      "SELECT id FROM shows WHERE profile_id = ?",
    ).bind(profileID).run<{ id: string }>();

    let allRehearsals: Rehearsal[] = [];

    if (showIDsResult.results.length) {
      const stmts = showIDsResult.results.map(x => db.prepare(
        `
        SELECT id, date, absent, were_run, todo_list, show_id FROM rehearsals
        WHERE show_id = ?
      `,
      ).bind(x.id),
      );

      const rehearsalsResult = await db.batch<Rehearsal>(stmts);
      allRehearsals = rehearsalsResult.flatMap(x => x.results);
    }

    return Response.json(allRehearsals);
  }

  if (routePath === '/full' && req.method === 'PUT') {
    const body = await req.json<ParsedShowRehearsal[]>();
  
    const stmts = body.map<D1PreparedStatement>(x => db.prepare(
      `
        INSERT OR REPLACE INTO rehearsals (id, date, absent, were_run, todo_list, show_id)
        VALUES (?, ?, ?, ?, ?, ?);
      `,
    ).bind(x.id, x.date, JSON.stringify(x.absent), JSON.stringify(x.wereRun), JSON.stringify(x.todoList), x.showID));
    await db.batch(stmts);
  
    return new Response;
  }
  

  return new Response;
}