DROP TABLE IF EXISTS config;

DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  last_modified TEXT
);

DROP TABLE IF EXISTS shows;
CREATE TABLE shows (
  id TEXT PRIMARY KEY,
  name TEXT,
  single_artist INTEGER,
  two_pm_rehearsal INTEGER,
  set_split_index INTEGER,
  profile_id TEXT,
  FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS songs;
CREATE TABLE songs (
  id TEXT PRIMARY KEY,
  name TEXT,
  artist TEXT,
  set_order NUMBER,
  color TEXT,
  show_id TEXT,
  FOREIGN KEY(show_id) REFERENCES shows(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS students;
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  name TEXT,
  main TEXT,
  castings TEXT,
  lesson TEXT,
  show_id TEXT,
  FOREIGN KEY(show_id) REFERENCES shows(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS rehearsals;
CREATE TABLE rehearsals (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  absent TEXT,
  were_run TEXT,
  todo_list TEXT,
  show_id TEXT,
  FOREIGN KEY(show_id) REFERENCES shows(id) ON DELETE CASCADE
);
