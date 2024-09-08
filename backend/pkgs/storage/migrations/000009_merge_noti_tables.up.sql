DROP TABLE IF EXISTS user_notification;
DROP TABLE IF EXISTS group_notification;

CREATE TABLE notification (
  noti_id TEXT PRIMARY KEY,
  receiver_id TEXT,
  noti_type TEXT,
  noti_content TEXT,
  noti_time TEXT,
  user_id TEXT,
  event_id TEXT,
  group_id TEXT,
  noti_status TEXT DEFAULT 'unread',

  FOREIGN KEY (receiver_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES group_event(event_id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES group_event(group_id) ON UPDATE CASCADE ON DELETE CASCADE
);
