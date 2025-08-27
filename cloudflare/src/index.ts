import handleProfilesRequest from './routes/profiles';
import handleRehearsalsRequest from './routes/rehearsals';
import handleShowsRequest from './routes/shows';
import handleSongsRequest from './routes/songs';
import handleStudentsRequest from './routes/students';

export default {
  async fetch(req, env): Promise<Response> {
    try {
      const url = new URL(req.url);

      if (url.pathname.startsWith('/api/profiles'))
        return handleProfilesRequest(req, env.DB);

      if (url.pathname.startsWith('/api/shows'))
        return handleShowsRequest(req, env.DB);

      if (url.pathname.startsWith('/api/songs'))
        return handleSongsRequest(req, env.DB);

      if (url.pathname.startsWith('/api/students'))
        return handleStudentsRequest(req, env.DB);

      if (url.pathname.startsWith('/api/rehearsals'))
        return handleRehearsalsRequest(req, env.DB);
    } catch (error) {
      console.log(error);
    }
    return new Response(null, { status: 400 });
  },
} satisfies ExportedHandler<Env>;
