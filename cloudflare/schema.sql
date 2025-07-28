DROP TABLE IF EXISTS config;
CREATE TABLE config (
  id INTEGER PRIMARY KEY,
  current_profile INTEGER
);
INSERT INTO config (id, current_profile)
VALUES (1, 1);

DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
  id INTEGER PRIMARY KEY,
  name TEXT,
  last_modified TEXT,
  shows TEXT
);
INSERT INTO profiles (id, name, last_modified, shows)
VALUES (1, 'default', '', '[]');

DROP TABLE IF EXISTS shows;
CREATE TABLE shows (
  id INTEGER PRIMARY KEY,
  name TEXT,
  single_artist INTEGER,
  two_pm_rehearsal INTEGER,
  set_split_index INTEGER,
  profile_id INTEGER,
  FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
INSERT INTO shows (id, name, single_artist, two_pm_rehearsal, set_split_index, profile_id)
VALUES (1, 'The Doors', 1, 1, 0, 1);

DROP TABLE IF EXISTS songs;
CREATE TABLE songs (
  id INTEGER PRIMARY KEY,
  name TEXT,
  artist TEXT,
  show_id INTEGER,
  FOREIGN KEY(show_id) REFERENCES shows(id) ON DELETE CASCADE
);
INSERT INTO songs (id, name, show_id)
VALUES (1, 'Light My Fire', 1);

DROP TABLE IF EXISTS students;
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT,
  main TEXT,
  castings TEXT,
  lesson TEXT,
  show_id INTEGER,
  FOREIGN KEY(show_id) REFERENCES shows(id) ON DELETE CASCADE
);
INSERT INTO students (id, name, main, castings, lesson, show_id)
VALUES (1, 'Lil Slugger', 'Drums', '[]', '', 1);

DROP TABLE IF EXISTS rehearsals;
CREATE TABLE rehearsals (
  id INTEGER PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  absent TEXT,
  were_run TEXT,
  todolist TEXT,
  show_id INTEGER,
  FOREIGN KEY(show_id) REFERENCES shows(id) ON DELETE CASCADE
);
INSERT INTO rehearsals (id, date, absent, were_run, todolist, show_id)
VALUES (1, '', '[]', '[]', '[]', 1);