import axios from "axios";
import { CommentModel } from "../interfaces";

export const getComments = async (
  postID: string
): Promise<CommentModel[] | string> => {
  if (!postID) {
    return "";
  }
  const res = await axios.get(`http://localhost:8080/comment/${postID}`, {
    withCredentials: true,
  });

  if (res.status !== 200) {
    return `the backend is not responding properly`;
  } else {
    console.log(res.data);
    return res.data.comments
      ? res.data.comments.map(
          (item: any): CommentModel => ({
            comment_id: item.comment_id,
            author_id: item.author_id,
            comment_likecount: item.comment_likecount,
            comment_content: item.comment_content,
            comment_is_liked: item.is_liked,
            comment_image_path: item.comment_image_path || "",
            created_at: item.created_at,
            full_user: {
              user_id: item.full_user.user_id,
              user_email: item.full_user.user_email,
              user_password: "", // ALWAYS Omit sensitive data
              user_fname: item.full_user.user_fname,
              user_lname: item.full_user.user_lname,
              user_dob: item.full_user.user_dob,
              user_avatar_path: item.full_user.user_avatar_path,
              user_nickname: item.full_user.user_nickname,
              user_about: item.full_user.user_about,
              profile_exposure: item.full_user.profile_exposure,
            },
          })
        )
      : "";
  }
};
