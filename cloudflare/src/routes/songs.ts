import { Song } from "../models/show-data";

interface ParsedSong {
  id: number;
  name: string;
  artist?: string;
  setOrder: number;
  color: string;
}

export default async function handleSongsRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  const routePath = url.pathname.split('/api/songs')[1];

  const showID = url.searchParams.get('showID');
  const songID = url.searchParams.get('songID');

  if (routePath === '' && req.method === 'GET' && showID) {
    const songsResult = await db.prepare(
        "SELECT id, name, artist, set_order, color FROM songs WHERE show_id = ?"
      ).bind(showID).run<Song>();
    const songs: ParsedSong[] = songsResult.results.map(x => ({ id: x.id, name: x.name, artist: x.artist, setOrder: x.set_order, color: x.color }));
    return Response.json(songs);
  }

  if (routePath === '' && req.method === 'PUT' && showID) {
    const body = await req.json<ParsedSong[]>();

    const stmts = body.map<D1PreparedStatement>(x => db.prepare(
      `
        INSERT OR REPLACE INTO songs (id, name, artist, set_order, color, show_id)
        VALUES ((SELECT id FROM songs WHERE id = ?), ?, ?, ?, ?, ?);
      `
    ).bind(x.id, x.name, x.artist || null, x.setOrder, x.color, showID))
    await db.batch(stmts);

    return new Response;
  }

  if (routePath === '' && req.method === 'DELETE' && songID) {
    await db.prepare(
      'DELETE FROM songs WHERE id = ?'
    ).bind(songID).run();

    return new Response;
  }

  return new Response;
}