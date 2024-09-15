import axios from "axios";
import Cookies from "js-cookie";
import { PostProps } from "../interfaces";

export const getFeed = async (): Promise<PostProps[] | string | undefined> => {
  try {
    if (!Cookies.get("session_id")) {
      return;
    }

    const res = await axios.get("http://localhost:8080/feed", {
      withCredentials: true,
    });

    if (res.status !== 200) {
      return `the backend is not responding properly`;
    } else {
      console.log(res.data);
      return res.data
        ? res.data.map(
            (item: any): PostProps => ({
              id: item.post.post_id,
              firstName: item.author.user_fname,
              lastName: item.author.user_lname,
              username: item.author.user_nickname,
              avatarUrl: item.author.user_avatar_path,
              created_at: item.post.created_at,
              postIsLiked: item.post.is_liked,
              post_content: item.post.post_content,
              post_image_path: item.post.post_image_path,
              post_likecount: item.post.post_likecount,
              postCommentNum: Array.isArray(item.post.comments) ? item.post.comments.length : 0,
            })
          )
        : undefined;
    }
  } catch (error) {
    console.error(error);
    return `error authenticating user`;
  }
};
