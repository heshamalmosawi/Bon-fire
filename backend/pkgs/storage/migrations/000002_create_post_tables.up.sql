CREATE TABLE post (
    post_id TEXT NOT NULL,
    post_content TEXT,
    post_image_path TEXT,
    post_exposure TEXT DEFAULT 'public',
    group_id TEXT,
    post_likecount INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    author_id TEXT,
    PRIMARY KEY (post_id),
    FOREIGN KEY (author_id) REFERENCES user (user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES "group" (group_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE post_like (
    listing_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY (listing_id),
    FOREIGN KEY (post_id) REFERENCES post (post_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (user_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE post_view (
    listing_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    PRIMARY KEY (listing_id),
    FOREIGN KEY (post_id) REFERENCES post (post_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (user_id) ON UPDATE CASCADE ON DELETE CASCADE
);