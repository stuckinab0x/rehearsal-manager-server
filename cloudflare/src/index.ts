import { getCurrentProfileShowNames, getShow } from "./db/functions";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/' && request.method === 'GET' && !url.searchParams.size) 
      return getCurrentProfileShowNames(env.DB);
    
    if (url.pathname === '/' && request.method === 'GET' && url.searchParams.get('showId'))
      return getShow(env.DB, parseInt(url.searchParams.get('showId')!));
    
    return new Response;
  },
} satisfies ExportedHandler<Env>;
