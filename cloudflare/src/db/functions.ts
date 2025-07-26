export const getCurrentProfileShowNames = async (db: D1Database): Promise<Response> => {
  const configResult = await db.prepare("SELECT current_profile FROM config WHERE id = 1").run<{ current_profile: number }>();
  const currentProfile = configResult.results[0].current_profile;

  const showsResult = await db.prepare(
    "SELECT name FROM shows WHERE profile_id = ?"
  ).bind(currentProfile).run<{ name: string; }>();
  const shows = showsResult.results.map(x => x.name);

  return Response.json(shows);
}

export const getShow = async (db: D1Database, showId: number): Promise<Response> => {
  console.log(showId)
  const showsResult = await db.prepare(
    "SELECT id, name, single_artist, two_pm_rehearsal, set_split_index FROM shows WHERE id = ?"
  ).bind(showId).run();

  const show = showsResult.results[0];

  const songsResult = await db.prepare(
    "SELECT id, name, artist FROM songs WHERE show_id = ?"
  ).bind(showId).run();
  const songs = songsResult.results;

  const studentsResult = await db.prepare(
    "SELECT id, name, main, castings, lesson FROM students WHERE show_id = ?"
  ).bind(showId).run();
  const students = studentsResult.results;

  const rehearsalsResult = await db.prepare(
    "SELECT id, date, absent, were_run, todolist FROM rehearsals WHERE show_id = ?"
  ).bind(showId).run();
  const rehearsals = rehearsalsResult.results;

  return Response.json({ ...show, songs, students, rehearsals });
}

export const getAllProfileShows = async (db: D1Database, profileId: number): Promise<Response> => {
  const showIdsResult = await db.prepare(
    "SELECT id FROM shows WHERE profile_id = ?"
  ).bind(profileId).run<{ id: number }>();
  const showIds = showIdsResult.results.map(x => x.id);
  
}