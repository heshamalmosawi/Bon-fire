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

CREATE TRIGGER updateLikeUp
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
    -- If comment_id is not NULL, update the comment's like count
    IF NEW.comment_id IS NOT NULL THEN
        UPDATE comment
        SET comment_likecount = comment_likecount + 1
        WHERE comment_id = NEW.comment_id;
    -- else update the post's like count
    ELSE
        UPDATE post
        SET post_likecount = post_likecount + 1
        WHERE post_id = NEW.post_id;
    END IF;
END;

CREATE TRIGGER updateLikeDown
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
    -- If comment_id is not NULL, update the comment's like count
    IF OLD.comment_id IS NOT NULL THEN
        UPDATE comment
        SET comment_likecount = comment_likecount - 1
        WHERE comment_id = OLD.comment_id;
    -- else update the post's like count
    ELSE
        UPDATE post
        SET post_likecount = post_likecount - 1
        WHERE post_id = OLD.post_id;
    END IF;
END;
