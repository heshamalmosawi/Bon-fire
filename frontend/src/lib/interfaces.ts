/**
 * these are properties each post will have
 */
interface PostProps {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
  creationDate: Date;
  postTextContent: string;
  postImageContentUrl: string;
  postLikeNum: number;
  postCommentNum: number;
}