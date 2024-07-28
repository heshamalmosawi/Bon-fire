CREATE TABLE user (
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_fname TEXT NOT NULL,
  user_lname TEXT NOT NULL,
  user_dob TEXT NOT NULL,
  user_avatar_path TEXT NOT NULL,
  user_nickname TEXT NOT NULL,
  user_about TEXT NOT NULL,
  profile_exposure TEXT NOT NULL,
  PRIMARY KEY (user_id)
);

CREATE TABLE user_follower (
  user_id TEXT NOT NULL,
  follower_id TEXT NOT NULL,
  PRIMARY KEY (user_id, follower_id),
  FOREIGN KEY (follower_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE user_following (
  user_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  PRIMARY KEY (user_id, following_id),
  FOREIGN KEY (following_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE user_notification (
  noti_id TEXT PRIMARY KEY,
  reciever_id TEXT,
  noti_type TEXT,
  noti_content TEXT,
  noti_time TEXT,
  noti_status TEXT DEFAULT 'unread',
  FOREIGN KEY (reciever_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);