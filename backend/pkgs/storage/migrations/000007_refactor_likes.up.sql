DROP TABLE IF EXISTS post_like;
DROP TABLE IF EXISTS comment_like;

CREATE TABLE IF NOT EXISTS likes (
  like_id TEXT PRIMARY KEY,
  post_id TEXT NULL DEFAULT NULL,
  comment_id TEXT NULL DEFAULT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES post(post_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comment(comment_id) ON UPDATE CASCADE ON DELETE CASCADE
);