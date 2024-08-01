CREATE TABLE private_message (
    message_id TEXT PRIMARY KEY NOT NULL,
    sender_id TEXT,
    recipient_id TEXT,
    message_content TEXT,
    message_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (recipient_id) REFERENCES user (user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES user (user_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE group_message (
    message_id TEXT PRIMARY KEY NOT NULL,
    sender_id TEXT NOT NULL,
    group_id TEXT,
    message_content TEXT,
    message_timestamp TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES "group" (group_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES group_user (member_id) ON UPDATE CASCADE ON DELETE CASCADE
);