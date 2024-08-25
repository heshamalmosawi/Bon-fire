import axios from "axios";

export const getFeed = async (): Promise<PostProps[] | undefined> => {
  const res = await axios.get("http://localhost:8080/feed", {
    withCredentials: true,
  });

  if (res.status !== 200) {
    return undefined;
  } else {
    return res.data
      ? res.data.map(
          (post: any): PostProps => ({
            id: post.id,
            firstName: post.firstName,
            lastName: post.lastName,
            username: post.username,
            avatarUrl: post.avatarUrl,
            creationDate: post.creationDate,
            postTextContent: post.postTextContent,
            postImageContentUrl: post.postImageContentUrl,
            postLikeNum: post.postLikeNum,
            postCommentNum: post.postCommentNum,
          })
        )
      : undefined;
  }
};
