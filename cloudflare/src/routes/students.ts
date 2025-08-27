import { ParsedShowStudent, ParsedStudent, Student } from '../models/student';
import { updateProfileTimestampFromShowID } from '../update-profile';

export default async function handleStudentsRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  
  const routePath = url.pathname.split('/api/students')[1];
  const profileID = url.searchParams.get('profileID');
  const showID = url.searchParams.get('showID');
  const studentID = url.searchParams.get('studentID');

  // Get All Students For Given Show ID
  if (routePath === '' && req.method === 'GET' && showID) {
    const studentsResult = await db.prepare(
      `
        SELECT id, name, main, castings, lesson FROM students
        WHERE show_id = ?
      `,
    ).bind(showID).run<Student>();
    return Response.json(studentsResult.results.map(x => ({ ...x, castings: JSON.parse(x.castings) })));
  }

  // Save Provided Students For Given Show ID
  if (routePath === '' && req.method === 'PUT' && showID) {
    const body = await req.json<ParsedStudent[]>();
    const stmts = body.map<D1PreparedStatement>(x => db.prepare(
      `
        INSERT OR REPLACE INTO students (id, name, main, castings, lesson, show_id)
        VALUES (?, ?, ?, ?, ?, ?);
      `,
    ).bind(x.id, x.name, x.main, JSON.stringify(x.castings), x.lesson || null, showID));
    await db.batch(stmts);

    await updateProfileTimestampFromShowID(db, showID);
  
    return new Response(null, { status: 204 });
  }

  // Delete Student Using Given ID
  if (routePath === '' && req.method === 'DELETE' && studentID) {
    const studentShowIDResult = await db.prepare(
      `
        SELECT show_id FROM students
        WHERE id = ?;
      `,
    ).bind(studentID).run<{ show_id: string }>();

    await db.prepare(
      'DELETE FROM students WHERE id = ?',
    ).bind(studentID).run();

    await updateProfileTimestampFromShowID(db, studentShowIDResult.results[0].show_id);

    return new Response(null, { status: 204 });
  }

  // App Routes //

  // Get All Students For Given Profile ID
  if (routePath === '/app' && req.method === 'GET' && profileID) {
    const showIDsResult = await db.prepare(
      `
        SELECT id FROM shows
        WHERE profile_id = ?
      `,
    ).bind(profileID).run<{ id: string }>();

    let allStudents: Student[] = [];

    if (showIDsResult.results.length) {
      const stmts = showIDsResult.results.map(x => db.prepare(
        `
          SELECT id, name, main, castings, lesson, show_id FROM students
          WHERE show_id = ?;
        `,
      ).bind(x.id),
      );
      const studentsResult = await db.batch<Student>(stmts);
      allStudents = studentsResult.flatMap(x => x.results);
    }

    return Response.json(allStudents);
  }
  
  // Save All Provided Students
  if (routePath === '/app' && req.method === 'PUT') {
    const body = await req.json<ParsedShowStudent[]>();

    const stmts = body.map<D1PreparedStatement>(x => db.prepare(
      `
        INSERT OR REPLACE INTO students (id, name, main, castings, lesson, show_id)
        VALUES (?, ?, ?, ?, ?, ?);
      `,
    ).bind(x.id, x.name, x.main, JSON.stringify(x.castings), x.lesson, x.showID));
    await db.batch(stmts);
  
    return new Response(null, { status: 204 });
  }

  return new Response(null, { status: 400 });
}
