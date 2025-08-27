export const updateProfileTimestamp = async (db: D1Database, profileID: string) => {
  await db.prepare(
    `
      UPDATE profiles
      SET last_modified = ?2
      WHERE id = ?1
    `,
  ).bind(profileID, new Date().toISOString()).run();
};

export const updateProfileTimestampFromShowID = async (db: D1Database, showID: string) => {
  const profileResult = await db.prepare(
    `
      SELECT profile_id FROM shows
      WHERE id = ?
    `,
  ).bind(showID).run<{ profile_id: string }>();

  await updateProfileTimestamp(db, profileResult.results[0].profile_id);
};

