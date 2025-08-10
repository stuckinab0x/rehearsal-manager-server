import handleProfilesRequest from "./routes/profiles";
import handleShowsRequest from "./routes/shows";
import handleSongsRequest from "./routes/songs";
import handleStudentsRequest from "./routes/students";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/shows')
      return handleShowsRequest(request, env.DB);

    if (url.pathname === '/api/songs')
      return handleSongsRequest(request, env.DB);

    if (url.pathname === '/api/students')
      return handleStudentsRequest(request, env.DB);

    if (url.pathname === '/api/profiles')
      return handleProfilesRequest(request, env.DB);

    return new Response;
  },
} satisfies ExportedHandler<Env>;
