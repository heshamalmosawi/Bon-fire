import axios from "axios";

export const getFeed = async (): Promise<PostProps[] | undefined> => {
  const res = await axios.get("http://localhost:8080/feed", {
    withCredentials: true,
  });

  if (res.status !== 200) {
    return undefined;
  } else {
    console.log(res.data);
    return res.data
      ? res.data.map(
          (item: any): PostProps => ({
            id: item.post_id,
            firstName: item.author.user_fname,
            lastName: item.author.user_lname,
            username: item.author.user_nickname,
            avatarUrl: item.author.user_avatar_path,
            creationDate: item.post.created_at,
            postTextContent: item.post.post_content,
            postImageContentUrl: item.post.post_image_path,
            postLikeNum: item.post.post_likecount,
            postCommentNum: 200, //FIXME: serve this in the frontend
          })
        )
      : undefined;
  }
};
