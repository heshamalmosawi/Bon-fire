/**
 * these are properties each post will have
 */
interface PostProps {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
  creationDate: string;
  postTextContent: string;
  postImageContentUrl: string;
  postLikeNum: number;
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

interface Profile {
  fname: string;
  lname: string;
  avatarUrl: string;
  bio: string;
  nickname: string;
  privacy: string;
}