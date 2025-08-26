import { Song, ParsedSong, ParsedShowSong } from '../models/song';

export default async function handleSongsRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  const routePath = url.pathname.split('/api/songs')[1];

  const profileID = url.searchParams.get('profileID');
  const showID = url.searchParams.get('showID');
  const songID = url.searchParams.get('songID');

  if (routePath === '' && req.method === 'GET' && showID) {
    const songsResult = await db.prepare(
      "SELECT id, name, artist, set_order, color FROM songs WHERE show_id = ?",
    ).bind(showID).run<Song>();
    const songs: ParsedSong[] = songsResult.results.map(x => ({ id: x.id, name: x.name, artist: x.artist, setOrder: x.set_order, color: x.color }));
    return Response.json(songs);
  }

  if (routePath === '' && req.method === 'PUT' && showID) {
    const body = await req.json<ParsedSong[]>();

    const stmts = body.map<D1PreparedStatement>(x => db.prepare(
      `
        INSERT OR REPLACE INTO songs (id, name, artist, set_order, color, show_id)
        VALUES (?, ?, ?, ?, ?, ?);
      `,
    ).bind(x.id, x.name, x.artist || null, x.setOrder, x.color, showID));
    await db.batch(stmts);

    return new Response;
  }

  if (routePath === '' && req.method === 'DELETE' && songID) {
    await db.prepare(
      'DELETE FROM songs WHERE id = ?',
    ).bind(songID).run();

    return new Response;
  }

  // app

  if (routePath === '/full' && req.method === 'GET' && profileID) {
    const showIDsResult = await db.prepare(
      "SELECT id FROM shows WHERE profile_id = ?",
    ).bind(profileID).run<{ id: string }>();

    let allSongs: Song[] = [];

    if (showIDsResult.results.length) {
      const stmts = showIDsResult.results.map(x => db.prepare(
        `
          SELECT id, name, artist, set_order, color, show_id FROM songs
          WHERE show_id = ?
        `,
      ).bind(x.id),
      );

      const songsResult = await db.batch<Song>(stmts);
      allSongs = songsResult.flatMap(x => x.results);
    }

    return Response.json(allSongs);
  }

  if (routePath === '/full' && req.method === 'PUT') {
    const body = await req.json<ParsedShowSong[]>();

    const stmts = body.map<D1PreparedStatement>(x => db.prepare(
      `
        INSERT OR REPLACE INTO songs (id, name, artist, set_order, color, show_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
    ).bind(x.id, x.name, x.artist || null, x.setOrder, x.color, x.showID));
    await db.batch(stmts);

    return new Response;
  }

  return new Response;
}