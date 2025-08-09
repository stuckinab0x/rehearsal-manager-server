export default async function handleProfilesRequest(req: Request<unknown, IncomingRequestCfProperties<unknown>>, db: D1Database): Promise<Response> {
  const url = new URL(req.url);
  const routePath = url.pathname.split('/api/profiles')[1];

  if (routePath === '' && req.method === 'GET' && !url.searchParams.size) {
    const profileNamesAndIDsResult = await db.prepare(
      "SELECT id, name FROM profiles"
    ).run<{ id: number; name: string; }>();
    return Response.json(profileNamesAndIDsResult.results);
  }

  if (routePath === '' && req.method === 'POST') {
    const profileName = await req.json<{ name: string }>();
    await db.prepare(
      `
        INSERT INTO profiles (name, last_modified)
        VALUES (?, "");
      `
    ).bind(profileName.name).run();
  }

  return new Response;
}