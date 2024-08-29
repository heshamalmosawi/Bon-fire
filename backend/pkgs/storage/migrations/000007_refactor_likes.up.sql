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

CREATE TRIGGER updateLikeUp_comment
AFTER INSERT ON likes
FOR EACH ROW
WHEN NEW.comment_id IS NOT NULL
BEGIN
    UPDATE comment
    SET comment_likecount = comment_likecount + 1
    WHERE comment_id = NEW.comment_id;
END;

CREATE TRIGGER updateLikeUp_post
AFTER INSERT ON likes
FOR EACH ROW
WHEN NEW.comment_id IS NULL
BEGIN
    UPDATE post
    SET post_likecount = post_likecount + 1
    WHERE post_id = NEW.post_id;
END;

CREATE TRIGGER updateLikeDown_comment
AFTER DELETE ON likes
FOR EACH ROW
WHEN OLD.comment_id IS NOT NULL
BEGIN
    UPDATE comment
    SET comment_likecount = comment_likecount - 1
    WHERE comment_id = OLD.comment_id;
END;

CREATE TRIGGER updateLikeDown_post
AFTER DELETE ON likes
FOR EACH ROW
WHEN OLD.comment_id IS NULL
BEGIN
    UPDATE post
    SET post_likecount = post_likecount - 1
    WHERE post_id = OLD.post_id;
END;

