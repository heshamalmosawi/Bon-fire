DROP TABLE IF EXISTS comment;

CREATE TABLE comment (
    comment_id TEXT NOT NULL,
    author_id TEXT,
    comment_image_path TEXT,
    post_id TEXT,
    comment_content TEXT,
    comment_likecount INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id),
    FOREIGN KEY (author_id) REFERENCES user (user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES post (post_id) ON UPDATE CASCADE ON DELETE CASCADE
);
