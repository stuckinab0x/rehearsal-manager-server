import { addShow, getAllProfileShows, getCurrentProfile, getProfileIDsAndNames, getProfileSummary, setCurrentProfile, setRehearsals, setShow } from "./db/functions";
import handleProfilesRequest from "./routes/profiles";
import handleShowsRequest from "./routes/shows";
import handleSongsRequest from "./routes/songs";
import handleStudentsRequest from "./routes/students";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    // shows
    if (url.pathname === '/api/shows')
      return handleShowsRequest(request, env.DB);

    if (url.pathname === '/api/songs')
      return handleSongsRequest(request, env.DB);

    if (url.pathname === '/api/students')
      return handleStudentsRequest(request, env.DB);

    if (url.pathname === '/api/profiles')
      return handleProfilesRequest(request, env.DB);

    // profiles

 
    // Profile Summary
    if (url.pathname === '/api/profiles' && request.method === 'GET') {
      const profileID = url.searchParams.get('profileID');
      if (!profileID)
        return new Response;
      const summary = await getProfileSummary(env.DB, parseInt(profileID));

      return Response.json(summary);
    }

    // Set Current Profile
    if (url.pathname === '/api/profiles' && request.method === 'PUT') {
      const profileID = url.searchParams.get('profileID');
      if (!profileID)
        return new Response;

      await setCurrentProfile(env.DB, parseInt(profileID));
    }
    return new Response;
  },
} satisfies ExportedHandler<Env>;
