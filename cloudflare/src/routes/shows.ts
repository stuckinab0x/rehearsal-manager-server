
import { ShowProps, ParsedShowProps } from '../models/show-props';

export default async function handleShowsRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  const routePath = url.pathname.split('/api/shows')[1];

  const profileID = url.searchParams.get('profileID');
  const showID = url.searchParams.get('showID');

  if (routePath === '' && req.method === 'GET' && profileID) {
    const showsResult = await db.prepare(
      "SELECT id, name FROM shows WHERE profile_id = ?"
    ).bind(profileID).run<{ id: number, name: string; }>();

    return Response.json(showsResult.results);
  }

  if (routePath === '' && req.method === 'GET' && showID) {
    const showsResult = await db.prepare(
      "SELECT id, name, single_artist, two_pm_rehearsal, set_split_index FROM shows WHERE id = ?;"
    ).bind(showID).run<ShowProps>();
    const show = showsResult.results[0];
    const parsedShow: ParsedShowProps = { id: show.id, name: show.name, singleArtist: show.single_artist === 1, twoPMRehearsal: show.two_pm_rehearsal === 1, setSplitIndex: show.set_split_index };

    return Response.json(parsedShow);
  }
  
  if (routePath === '' && req.method === 'POST' && req.body && profileID) {
    const show: ParsedShowProps = await req.json();
    
    await db.prepare(
      `
        INSERT INTO shows (id, name, single_artist, two_pm_rehearsal, set_split_index, profile_id)
        VALUES (?, ?, ?, ?, ?, ?);
      `
    ).bind(show.id, show.name, show.singleArtist, show.twoPMRehearsal, show.setSplitIndex, profileID).run();

    return new Response;
  }
  
  if (routePath === '' && req.method === 'PUT' && req.body && profileID) {
    const show = await req.json<ParsedShowProps>();
        
    await db.prepare(
      `
        UPDATE shows
        SET name = ?2, single_artist = ?3, two_pm_rehearsal = ?4, set_split_index = ?5, profile_id = ?6
        WHERE id = ?1;
      `
    ).bind(show.id, show.name, show.singleArtist, show.twoPMRehearsal, show.setSplitIndex, profileID).run();

    return new Response;
  }

  // app

  if (routePath === '/full' && req.method === 'GET' && profileID) {
    const showsResult = await db.prepare(
      `
        SELECT id, name, single_artist, two_pm_rehearsal, set_split_index
        FROM shows WHERE profile_id = ?;
      `
    ).bind(profileID).run<ShowProps>();
    const shows = showsResult.results.map<ParsedShowProps>(x => ({ id: x.id, name: x.name, singleArtist: x.single_artist === 1, twoPMRehearsal: x.two_pm_rehearsal === 1, setSplitIndex: x.set_split_index  }));
    return Response.json(shows);
  }

  if (routePath === '/full' && req.method === 'PUT' && profileID) {
    const showsProps = await req.json<ParsedShowProps[]>();

    const stmts = showsProps.map(x => db.prepare(
      `
        INSERT OR REPLACE INTO shows (id, name, single_artist, two_pm_rehearsal, set_split_index, profile_id)
        VALUES (?, ?, ?, ?, ?, ?);
      `
    ).bind(x.id, x.name, x.singleArtist, x.twoPMRehearsal, x.setSplitIndex, profileID));
        
    await db.batch(stmts);

    return new Response;
  }
  
  return new Response;
}
