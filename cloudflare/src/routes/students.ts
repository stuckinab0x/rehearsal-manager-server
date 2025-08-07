import { Student } from '../models/show-data';

interface ParsedStudent {
  id: number;
  name: string;
  main: string;
  castings: any[];
  lesson: string;
}

export default async function handleStudentsRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  
  const routePath = url.pathname.split('/api/students')[1];
  const showID = url.searchParams.get('showID');

  if (routePath === '' && req.method === 'GET' && showID) {
    const studentsResult = await db.prepare(
      "SELECT id, name, main, castings, lesson FROM students WHERE show_id = ?"
    ).bind(showID).run<Student>();
    return Response.json(studentsResult.results.map(x => ({ ...x, castings: JSON.parse(x.castings) })));
  }

   if (routePath === '' && req.method === 'PUT' && showID) {
      const body = await req.json<ParsedStudent[]>();
      console.log(body)
      const stmts = body.map<D1PreparedStatement>(x => db.prepare(
        `
          INSERT OR REPLACE INTO students (id, name, main, castings, lesson, show_id)
          VALUES ((SELECT id FROM students WHERE id = ?), ?, ?, ?, ?, ?);
        `
      ).bind(x.id, x.name, x.main, JSON.stringify(x.castings), x.lesson, showID))
      await db.batch(stmts);
  
      return new Response;
    }

  return new Response;
}