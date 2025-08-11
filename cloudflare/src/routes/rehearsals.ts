import { Rehearsal, ParsedRehearsal } from '../models/rehearsal';

export default async function handleRehearsalsRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  const routePath = url.pathname.split('/api/rehearsals')[1];

  const profileID = url.searchParams.get('profileID');
  const showID = url.searchParams.get('showID');

  if (routePath === '/' && req.method === 'GET' && showID) {
    const rehearsalsResult = await db.prepare(
        "SELECT id, date, absent, were_run, todolist FROM rehearsals WHERE show_id = ?"
      ).bind(showID).run<Rehearsal>();
    const rehearsals = rehearsalsResult.results.map<ParsedRehearsal>(x => ({ id: x.id, date: x.date, absent: JSON.parse(x.absent), wereRun: JSON.parse(x.were_run), todoList: JSON.parse(x.todo_list) }));
    return Response.json(rehearsals);
  }

  if (routePath === '/full' && req.method === 'GET' && profileID) {
    const showIDsResult = await db.prepare(
      "SELECT id FROM shows WHERE profile_id = ?"
    ).bind(profileID).run<{ id: string }>();

    const stmts = showIDsResult.results.map(x => db.prepare(
        `
          SELECT id, date, absent, were_run, todo_list, show_id
          WHERE show_id = ?
        `
      ).bind(x.id)
    );

    const rehearsalsResult = await db.batch<Rehearsal>(stmts);
    const allRehearsals = rehearsalsResult.flatMap(x => x.results);

    return Response.json(allRehearsals);
  }

  return new Response;
}