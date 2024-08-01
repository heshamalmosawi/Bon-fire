CREATE TABLE "group" (
  group_id TEXT PRIMARY KEY,
  owner_id TEXT,
  group_name TEXT NOT NULL,
  group_desc TEXT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES "user" (user_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE group_event (
  event_id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  creator_id TEXT,
  event_title TEXT,
  event_description TEXT,
  event_timestamp TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES group_user (member_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES "group" (group_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE group_event_attendance (
  attendance_id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  attendee_id TEXT,
  response_Type TEXT,
  FOREIGN KEY (attendee_id) REFERENCES group_user (member_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES group_event (event_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE group_interactions (
  interaction_ID TEXT PRIMARY KEY,
  group_Id TEXT NOT NULL,
  user_id TEXT,
  interaction_Type BOOLEAN,
  status TEXT,
  interaction_Time TIMESTAMP,
  FOREIGN KEY (group_Id) REFERENCES "group" (group_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE group_notification (
  noti_id TEXT PRIMARY KEY,
  group_id TEXT,
  noti_type TEXT,
  noti_content TEXT,
  noti_time TIMESTAMP,
  noti_status TEXT DEFAULT 'unread',
  FOREIGN KEY (group_id) REFERENCES "group" (group_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE group_user (
  member_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id TEXT,
  FOREIGN KEY (group_id) REFERENCES "group" (group_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON UPDATE CASCADE ON DELETE CASCADE
);
