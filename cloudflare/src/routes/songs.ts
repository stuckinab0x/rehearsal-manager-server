import { Song } from "../models/show-data";

export default async function handleSongsRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  const routePath = url.pathname.split('/api/songs')[1];

  const showID = url.searchParams.get('showID');

  if (routePath === '' && req.method === 'GET' && showID) {
    const songsResult = await db.prepare(
        "SELECT id, name, artist, color FROM songs WHERE show_id = ?"
      ).bind(showID).run<{ id: number; name: string; artist?: string; color: string; }>();
    const songs: Song[] = songsResult.results;
    return Response.json(songs);
  }

  if (routePath === '' && req.method === 'PUT' && showID) {
    const body = await req.json<Song[]>();

    const stmts = body.map<D1PreparedStatement>(x => db.prepare(
      `
        INSERT OR REPLACE INTO songs (id, name, artist, color, show_id)
        VALUES ((SELECT id FROM songs WHERE id = ?), ?, ?, ?, ?);
      `
    ).bind(x.id, x.name, x.artist || null, x.color, showID))
    await db.batch(stmts);

    return new Response;
  }

  return new Response;
}