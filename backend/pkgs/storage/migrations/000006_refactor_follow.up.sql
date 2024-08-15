DROP TABLE IF EXISTS user_follower;
DROP TABLE IF EXISTS user_following;

CREATE TABLE user_follow (
  user_id TEXT NOT NULL,
  follower_id TEXT NOT NULL,
  PRIMARY KEY (user_id, follower_id),
  FOREIGN KEY (follower_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE
);
