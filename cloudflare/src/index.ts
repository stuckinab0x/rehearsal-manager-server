import { addShow, getAllProfileShows, getCurrentProfileShowNames, getProfileIDsAndNames, getProfileSummary, getShow, setCurrentProfile, setRehearsals, setShow } from "./db/functions";
import Show, { ShowData } from "./models/show-data";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    // shows

    if (url.pathname === '/shows' && request.method === 'GET' && !url.searchParams.size) {
      const profileShowNames = await getCurrentProfileShowNames(env.DB);

      return Response.json(profileShowNames);
    }
    
    if (url.pathname === '/shows' && request.method === 'GET' && url.searchParams.get('showId'))
      return Response.json(getShow(env.DB, parseInt(url.searchParams.get('showId')!)));

    if (url.pathname === '/shows/all') {    
      const profileID = url.searchParams.get('profileId');
      if (!profileID)
        return new Response;

      const allShows = await getAllProfileShows(env.DB, parseInt(profileID))
      return Response.json(allShows);
    }

    if (url.pathname === '/shows' && request.method === 'PUT' && request.body) {
      const show = await request.json<ShowData>();
      
      const showID = url.searchParams.get('showID');
      if (showID) {
        const showExistsResults = await env.DB.prepare('SELECT id FROM shows WHERE id = ?').bind(parseInt(showID)).run();
        if (showExistsResults.results.length)
          setShow(env.DB, show, parseInt(showID));
        return new Response;
      }
      else {
          await addShow(env.DB, show);
        return new Response;
      }
    }

    if (url.pathname === '/shows' && request.method === 'PUT' && url.searchParams.size && request.body) {
      const showID = url.searchParams.get('showID');
      if (!showID)
        return new Response;

      const { id, name, singleArtist, twoPmRehearsal, setSplitIndex, cast, songs, rehearsals } = await request.json<Show>();
      await setShow(env.DB, { id, name, singleArtist, twoPmRehearsal, setSplitIndex, cast, songs }, parseInt(showID));

      await setRehearsals(env.DB, rehearsals, id);
    }
      
    // profiles
    
    // List of Profile Names
    if (url.pathname === '/profiles' && request.method === 'GET' && !url.searchParams.size) {
      const profileNames = await getProfileIDsAndNames(env.DB);

      return Response.json(profileNames);
    }

    // Profile Summary
    if (url.pathname === '/profiles' && request.method === 'GET') {
      const profileID = url.searchParams.get('profileID');
      if (!profileID)
        return new Response;

      const summary = await getProfileSummary(env.DB, parseInt(profileID));

      return Response.json(summary);
    }

    // Set Current Profile
    if (url.pathname === '/profiles' && request.method === 'PUT') {
      const profileID = url.searchParams.get('profileID');
      if (!profileID)
        return new Response;

      await setCurrentProfile(env.DB, parseInt(profileID));
    }

    return new Response;
  },
} satisfies ExportedHandler<Env>;
