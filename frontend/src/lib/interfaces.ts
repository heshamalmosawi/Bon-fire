/**
 * these are properties each post will have
 */
// ​​
// author_id: "1aee23c6-52a6-4de1-b771-b26389b8ed43"
// ​​​
// created_at: "2024-08-29T18:43:07+03:00"
// ​​​
// group_id: "00000000-0000-0000-0000-000000000000"
// ​​​
// post_content: "cszdc"
// ​​​
// post_exposure: "public"
// ​​​
// post_id: "71c78886-2ca5-4524-a5c8-9297a73b5c9b"
// ​​​
// post_image_path: ""
// ​​​
// post_likecount: 0

interface PostProps {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
  created_at: string;
  post_content: string;
  post_image_path: string;
  post_likecount: number;
  postCommentNum: number;
}

/**
 * interface representing a user
 */
// interface UserModel {
//   userId: string;
//   userEmail: string;
//   userPassword: string;
//   userFirstName: string;
//   userLastName: string;
//   userDOB: string;
//   userAvatarPath: string;
//   userNickname: string;
//   userBio: string;
//   profileExposure: string;
// }

export interface Profile {
  fname: string;
  lname: string;
  avatarUrl: string;
  bio: string;
  nickname: string;
  privacy: string;
  is_followed: boolean;
}