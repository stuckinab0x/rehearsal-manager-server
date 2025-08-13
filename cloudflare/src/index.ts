import handleProfilesRequest from "./routes/profiles";
import handleRehearsalsRequest from "./routes/rehearsals";
import handleShowsRequest from "./routes/shows";
import handleSongsRequest from "./routes/songs";
import handleStudentsRequest from "./routes/students";

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/profiles'))
      return handleProfilesRequest(request, env.DB);

    if (url.pathname.startsWith('/api/shows'))
      return handleShowsRequest(request, env.DB);

    if (url.pathname.startsWith('/api/songs'))
      return handleSongsRequest(request, env.DB);

    if (url.pathname.startsWith('/api/students'))
      return handleStudentsRequest(request, env.DB);

    if (url.pathname.startsWith('/api/rehearsals'))
      return handleRehearsalsRequest(request, env.DB);

    return new Response;
  },
} satisfies ExportedHandler<Env>;
