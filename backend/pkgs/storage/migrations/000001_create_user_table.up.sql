CREATE TABLE user (
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_fname TEXT NOT NULL,
    user_lname TEXT NOT NULL,
    user_dob TEXT NOT NULL,
    user_avatar_path TEXT NOT NULL,
    user_nickname TEXT NOT NULL,
    user_about TEXT NOT NULL,
    profile_exposure TEXT,
    
    PRIMARY KEY (user_id)
);
