import ProfileSummary from '../models/profile-summary';
import { Show, Rehearsal, Song, Student } from '../models/show-data';

export const getProfileShowIDsAndNames = async (db: D1Database, profileID: number): Promise<{ id: number, name: string; }[]> => {

  const showsResult = await db.prepare(
    "SELECT id, name FROM shows WHERE profile_id = ?"
  ).bind(profileID).run<{ id: number, name: string; }>();
  return showsResult.results;
}

export const addShow = async (db: D1Database, show: Show): Promise<void> => {
  const currentProfileIDResult = await db.prepare("SELECT current_profile FROM config WHERE id = 1").run<{ current_profile: number; }>();
  const currentProfileID = currentProfileIDResult.results[0].current_profile;

  await db.prepare(
    `
      INSERT INTO shows (name, single_artist, two_pm_rehearsal, set_split_index, profile_id)
      VALUES (?, ?, ?, ?, ?);
    `
  ).bind(show.name, show.singleArtist ? 1 : 0, show.twoPmRehearsal ? 1: 0, show.setSplitIndex, currentProfileID).run();

  const thisShowIdResult = await db.prepare("SELECT id FROM shows WHERE name = ?").bind(show.name).run<{ id: number; }>();
  const thisShowId = thisShowIdResult.results[0].id;

  const castStatements = show.cast.map(x => db.prepare(
    `
      INSERT INTO students (name, main, castings, lesson, show_id)
      VALUES (?, ?, ?, ?, ?)
    `
  ).bind(x.name, x.main, JSON.stringify(x.castings), x.lesson, thisShowId));

  const songStatements = show.songs.map(x => db.prepare(
    `
      INSERT INTO songs (name, artist, show_id)
      VALUES (?, ?, ?)
    `
  ).bind(x.name, x.artist, thisShowId));

  await db.batch([...castStatements, ...songStatements]);
};

export const setShow = async (db: D1Database, show: Show, showId: number): Promise<void> => {
  const currentProfileIDResult = await db.prepare("SELECT current_profile FROM config WHERE id = 1").run<{ current_profile: number; }>();
  const currentProfileID = currentProfileIDResult.results[0].current_profile;
  await db.prepare(
    `
      UPDATE shows
      SET name = ?, single_artist = ?, two_pm_rehearsal = ?, set_split_index = ?, profile_id = ?
      WHERE id = ?;
    `
  ).bind(show.name, show.singleArtist ? 1 : 0, show.twoPmRehearsal ? 1: 0, show.setSplitIndex, currentProfileID, showId).run();
};

export const setRehearsals = async (db: D1Database, rehearsals: Rehearsal[], showID: number) => {
  const rehearsalStatements = rehearsals.map(x => 
    db.prepare(
      `
        INSERT INTO rehearsals (date, absent, were_run, todolist, show_id)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT (date) DO UPDATE SET
          date = ?1,
          absent = ?2,
          were_run = ?3,
          todolist = ?4,
          show_id = ?5
          WHERE date = ?1;
      `
    ).bind(x.date, JSON.stringify(x.absent), JSON.stringify(x.wereRun), JSON.stringify(x.todoList), showID)
  )

  await db.batch(rehearsalStatements);
}

// Profile methods

export const getCurrentProfile = async (db: D1Database): Promise<string> => {
  const currentProfileResult = await db.prepare(
    'SELECT current_profile FROM config WHERE id = 1'
  ).run<{ current_profile: string }>();
  return currentProfileResult.results[0].current_profile;
}

//this is for the app only
export const getAllProfileShows = async (db: D1Database, profileId: number): Promise<Show[]> => {
  const showIdsResult = await db.prepare(
    "SELECT id FROM shows WHERE profile_id = ?"
  ).bind(profileId).run<{ id: number }>();
  const pendingShows = showIdsResult.results.map(x => getShow(db, x.id));
  const shows = await Promise.all(pendingShows);
  return shows;
}

export const getProfileIDsAndNames = async (db: D1Database): Promise<{ id: number; name: string }[]> => {
  const profileNamesResult = await db.prepare(
    "SELECT id, name FROM profiles"
  ).run<{ id: number; name: string; }>();

  return profileNamesResult.results;
}

export const getProfileSummary = async (db: D1Database, profileID: number): Promise<ProfileSummary> => {
  const profileResult = await db.prepare(
    "SELECT name, last_modified FROM profiles WHERE id = ?"
  ).bind(profileID).run<{ name: string; last_modified: string; }>();

  const shows = await getAllProfileShows(db, profileID);
  
  return {
    profileName: profileResult.results[0].name,
    lastModified: new Date(profileResult.results[0].last_modified),
    shows: shows.map(x => ({ name: x.name, songNames: x.songs.map(x => x.name), noOfRehearsals: x.rehearsals.length })),
  }
}

export const setCurrentProfile = async (db: D1Database, profileID: number): Promise<void> => {
  await db.prepare(
    "UPDATE config SET current_profile = ? WHERE id = 1 "
  ).bind(profileID).run();
}
