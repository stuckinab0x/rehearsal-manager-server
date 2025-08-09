import { getProfileShowIDsAndNames, getAllProfileShows, setShow, addShow, setRehearsals } from '../db/functions';
import { Show } from '../models/show-data';

interface ParsedShow {
  id: number;
  name: string;
  singleArtist: boolean;
  twoPMRehearsal: boolean;
  setSplitIndex: number;
}

export default async function handleShowsRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  const routePath = url.pathname.split('/api/shows')[1];

  const profileID = url.searchParams.get('profileID');
  const showID = url.searchParams.get('showID');

  
  if (routePath === '' && req.method === 'GET' && profileID) {

    const profileShowIDsAndNames = await getProfileShowIDsAndNames(db, parseInt(profileID));
    return Response.json(profileShowIDsAndNames);
  }
      
  if (routePath === '' && req.method === 'GET' && showID) {
    const showsResult = await db.prepare(
    "SELECT id, name, single_artist, two_pm_rehearsal, set_split_index FROM shows WHERE id = ?"
    ).bind(showID).run<Show>();
    const show = showsResult.results[0];
    const parsedShow: ParsedShow = { id: show.id, name: show.name, singleArtist: show.single_artist === 1, twoPMRehearsal: show.two_pm_rehearsal === 1, setSplitIndex: show.set_split_index };

    return Response.json(parsedShow);
  }
  
  // this route is for the app only
  // if (routePath === '/all') {    
  //       const profileID = url.searchParams.get('profileId');
  //   if (!profileID)
  //     return new Response;
  
  //     const allShows = await getAllProfileShows(env.DB, parseInt(profileID))
  //     return Response.json(allShows);
  // }

  if (routePath === '' && req.method === 'POST' && req.body && profileID) {
    const show: ParsedShow = await req.json();
    
    await db.prepare(
      `
        INSERT INTO shows (name, single_artist, two_pm_rehearsal, set_split_index, profile_id)
        VALUES (?, ?, ?, ?, ?);
      `
    ).bind(show.name, show.singleArtist, show.twoPMRehearsal, show.setSplitIndex, profileID).run();


    const newestShowIDResult = await db.prepare(
        "SELECT MAX(id) FROM shows"
      ).run<{ "MAX(id)": number; }>();

    return Response.json({ newID: newestShowIDResult.results[0]['MAX(id)'] });
  }
  
  if (routePath === '' && req.method === 'PUT' && req.body && profileID) {
    const show = await req.json<ParsedShow>();
        
    await db.prepare(
      `
        UPDATE shows
        SET name = ?2, single_artist = ?3, two_pm_rehearsal = ?4, set_split_index = ?5, profile_id = ?6
        WHERE id = ?1
      `
    ).bind(show.id, show.name, show.singleArtist, show.twoPMRehearsal, show.setSplitIndex, profileID).run();

    return new Response;
  }
  
  return new Response;
}
