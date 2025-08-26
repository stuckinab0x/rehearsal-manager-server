import ProfileSummary, { ShowBackupInfo } from "../models/profile-summary";

export default async function handleProfilesRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  const routePath = url.pathname.split('/api/profiles')[1];

  const profileID = url.searchParams.get('profileID');

  if (routePath === '' && req.method === 'GET' && !profileID) {
    const profileNamesAndIDsResult = await db.prepare(
      "SELECT id, name FROM profiles",
    ).run<{ id: number; name: string; }>();
    return Response.json(profileNamesAndIDsResult.results);
  }

  if (routePath === '' && req.method === 'POST') {
    const profile = await req.json<{ id: string, name: string }>();
    await db.prepare(
      `
        INSERT INTO profiles (id, name, last_modified)
        VALUES (?, ?, "");
      `,
    ).bind(profile.id, profile.name).run();
  }
  
  // app

  if (routePath === '' && req.method === 'GET' && profileID) {
    const profileInfoResult = await db.prepare(
      "SELECT name, last_modified FROM profiles WHERE id = ?",
    ).bind(profileID).run<{ name: string; last_modified: string; }>();

    const showsResult = await db.prepare(
      "SELECT id, name FROM shows WHERE profile_id = ?",
    ).bind(profileID).run<{ id: string; name: string }>();

    const songsStmts = showsResult.results.map(x => db.prepare("SELECT name, show_id FROM songs WHERE show_id = ?").bind(x.id));
    let allSongs: { name: string; show_id: string }[] = [];
    if (songsStmts.length) {
      const songsResults = await db.batch<{ name: string; show_id: string; }>(songsStmts);
      allSongs = songsResults.flatMap(x => x.results);
    }

    const rehearalsStmts = showsResult.results.map(x => db.prepare("SELECT show_id FROM rehearsals WHERE show_id = ?").bind(x.id));
    let allRehearsals: { show_id: string }[] = [];
    
    if (rehearalsStmts.length) {
      const rehearsalsResults = await db.batch<{ show_id: string; }>(rehearalsStmts);
      allRehearsals = rehearsalsResults.flatMap(x => x.results);
    }
    
    const shows = showsResult.results.map<ShowBackupInfo>(x => ({
      name: x.name,
      songNames: allSongs.filter(song => song.show_id === x.id).map(x => x.name),
      noOfRehearsals: allRehearsals.filter(rehearsal => rehearsal.show_id === x.id).length,
    }));

    const summary: ProfileSummary = { lastModified: profileInfoResult.results[0]?.last_modified || '', shows };

    return Response.json(summary);
  }

  return new Response;
}