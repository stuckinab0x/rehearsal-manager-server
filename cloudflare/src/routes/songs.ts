import { Song, ParsedSong, ParsedShowSong } from '../models/song';
import { updateProfileTimestampFromShowID } from '../update-profile';

export default async function handleSongsRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  const routePath = url.pathname.split('/api/songs')[1];

  const profileID = url.searchParams.get('profileID');
  const showID = url.searchParams.get('showID');
  const songID = url.searchParams.get('songID');

  // Get All Songs For Given Show ID
  if (routePath === '' && req.method === 'GET' && showID) {
    const songsResult = await db.prepare(
      `
        SELECT id, name, artist, set_order, color FROM songs
        WHERE show_id = ?
      `,
    ).bind(showID).run<Song>();
    const songs: ParsedSong[] = songsResult.results.map(x => ({ id: x.id, name: x.name, artist: x.artist, setOrder: x.set_order, color: x.color }));
    return Response.json(songs);
  }

  // Save Provided Songs For Given Show ID
  if (routePath === '' && req.method === 'PUT' && showID) {
    const body = await req.json<ParsedSong[]>();

    const stmts = body.map<D1PreparedStatement>(x => db.prepare(
      `
        INSERT OR REPLACE INTO songs (id, name, artist, set_order, color, show_id)
        VALUES (?, ?, ?, ?, ?, ?);
      `,
    ).bind(x.id, x.name, x.artist || null, x.setOrder, x.color, showID));
    await db.batch(stmts);

    await updateProfileTimestampFromShowID(db, showID);

    return new Response(null, { status: 204 });
  }

  // Delete Song With Given Song ID
  if (routePath === '' && req.method === 'DELETE' && songID) {
    const songShowIDResult = await db.prepare(
      `
        SELECT show_id FROM songs
        WHERE id = ?
      `,
    ).bind(songID).run<{ show_id: string }>();

    await db.prepare(
      'DELETE FROM songs WHERE id = ?',
    ).bind(songID).run();

    await updateProfileTimestampFromShowID(db, songShowIDResult.results[0].show_id);

    return new Response(null, { status: 204 });
  }

  // App Routes //

  // Get All Songs For Given Profile ID
  if (routePath === '/app' && req.method === 'GET' && profileID) {
    const showIDsResult = await db.prepare(
      `
        SELECT id FROM shows
        WHERE profile_id = ?
      `,
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
  
  // Save All Provided Songs
  if (routePath === '/app' && req.method === 'PUT') {
    const body = await req.json<ParsedShowSong[]>();

    const stmts = body.map<D1PreparedStatement>(x => db.prepare(
      `
        INSERT OR REPLACE INTO songs (id, name, artist, set_order, color, show_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
    ).bind(x.id, x.name, x.artist || null, x.setOrder, x.color, x.showID));
    await db.batch(stmts);

    return new Response(null, { status: 204 });
  }

  return new Response(null, { status: 400 });
}