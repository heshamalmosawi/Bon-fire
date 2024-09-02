import axios from "axios";
import { Comment } from "../interfaces";

export const getComments = async (
  postID: string
): Promise<Comment[] | string> => {
  const res = await axios.get(`http://localhost:8080/comment/${postID}`, {
    withCredentials: true,
  });

  if (res.status !== 200) {
    return `the backend is not responding properly`;
  } else {
    console.log(res.data);
    return res.data.comments
      ? res.data.comments.map(
          (item: any): Comment => ({
            comment_id: item.comment_id,
            author_id: item.author_id,
            comment_like_num: item.comment_likecount,
            comment_text: item.comment_content,
            comment_image_uri: "",
            comment_author_avatar_uri: ""
          })
        )
      : "";
  }
};
