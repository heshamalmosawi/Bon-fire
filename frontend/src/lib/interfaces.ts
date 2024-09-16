/**
 * these are properties each post will have
 */
export interface PostProps {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
  created_at: string;
  post_content: string;
  post_image_path: string;
  post_likecount: number;
  postIsLiked: boolean;
  postCommentNum: number;
}

export interface CommentModel {
  comment_id: string;
  author_id: string;
  comment_content: string;
  comment_likecount: number;
  created_at: string;
  comment_is_liked: boolean;
  comment_image_path: string;

  full_user: UserModel;
}

export interface UserModel {
  user_id: string;
  user_email: string;
  user_password: string;
  user_fname: string;
  user_lname: string;
  user_dob: string;
  user_avatar_path: string;
  user_nickname: string;
  user_about: string;
  profile_exposure: string;
}

export interface GroupUserModel {
  user_id: string;
  user_email: string;
  user_password: string;
  user_fname: string;
  user_lname: string;
  user_dob: string;
  user_avatar_path: string;
  user_nickname: string;
  user_about: string;
  profile_exposure: string;
  is_invited: boolean;
}

export interface Profile {
  fname: string;
  lname: string;
  email: string;
  avatarUrl: string;
  dob: string;
  bio: string;
  nickname: string;
  privacy: string;
  is_followed: boolean;
  is_requested: boolean;
}

export interface Group {
  group_id: string;
  owner_id: string;
  group_name: string;
  group_desc: string;
  is_member: boolean;
  total_members: number;
  is_requested: boolean; // Extended
}

export interface GroupProps {
  groupName: string;
  ownerName: string;
  owner: string;
  ownerEmail: string;
  description: string;
  session_user: string;
  groupID: string;
  ownerFullName: string;
  total_members: number;
}

export interface RequestProps {
  id: string; // The ID of the user making the request
  username: string; // The username of the user
  creationDate: string; // When the request was created
  avatarUrl: string; // Optional avatar URL
  groupID: string; // The ID of the group the user wants to join
  onRequestHandled: (id: string) => void; // Function to handle the request
}

export interface chatMessage {
  from: string;
  to: string;
  message: string;
}

export interface Notification {
  notiID: string; // uuid
  notiType: string;
  notiContent: string;
  recieverID: string;
  userID: string;
  groupID: string;
  eventID: string;
  notiRead: boolean;
}

export interface BonfireEvent {
  eventID: string;
  groupID: string;
  eventTitle: string;
  eventDesc: string;
  eventDate: Date;
  eventDuration: number;
}

export interface GroupEvent {
  event_id: string;
  group_id: string;
  creator_id: string;
  event_title: string;
  event_description: string;
  event_timestamp: string; // or Date if you prefer Date objects
  is_going: boolean;
  did_respond: boolean;
  attendees: number;
}

export interface Follower {
  id: string;
  name: string;
}