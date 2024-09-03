/**
 * these are properties each post will have
 */
export interface PostProps {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
  creationDate: string;
  postTextContent: string;
  postImageContentUrl: string;
  postLikeNum: number;
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

export interface Profile {
  fname: string;
  lname: string;
  avatarUrl: string;
  bio: string;
  nickname: string;
  privacy: string;
}

export interface Group {
  group_id: string;
  owner_id: string;
  group_name: string;
  group_desc: string;
  is_member: boolean;
  total_members: number; // Extended
}

export interface GroupProps {
  groupName: string;
  ownerName: string;
  owner:string;
  ownerEmail:string;
  description: string;
  session_user: string;
  groupID: string;
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



