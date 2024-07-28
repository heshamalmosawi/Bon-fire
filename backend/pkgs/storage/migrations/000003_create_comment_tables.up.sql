CREATE TABLE comment (
    comment_id TEXT NOT NULL,
    author_id TEXT,
    post_id TEXT,
    comment_content TEXT,
    comment_likecount INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id),
    FOREIGN KEY (author_id) REFERENCES user (user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES post (post_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE comment_like (
    listing_id TEXT NOT NULL,
    comment_id TEXT,
    user_id TEXT,
    PRIMARY KEY (listing_id),
    FOREIGN KEY (comment_id) REFERENCES comment (comment_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (user_id) ON UPDATE CASCADE ON DELETE CASCADE
);