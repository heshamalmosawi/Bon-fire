import { z } from "zod";
import { HandleFileUpload } from "../handleFileUpload";
import axios from "axios";

export const createPostSchema = z.object({
  textContent: z.string().min(5),
  imageContent: z.instanceof(File).optional(),
});

export const HandleCreatePost = async (
  values: z.infer<typeof createPostSchema>
) => {
  const payload = new FormData();

  payload.append("post_content", values.textContent);
  payload.append(
    "post_image_path",
    values.imageContent ? await HandleFileUpload(values.imageContent) : ""
  );

  const payload2 = {
    post_content: values.textContent,
    post_image_path: values.imageContent ? await HandleFileUpload(values.imageContent) : "", // If you need to pass an image path
    post_exposure: "public", // Replace with your actual value
    group_id: "", // Optional, if you have a group ID
};


  // export const creat_comment = async (comment_data) => {
  //   const res = await fetch(BACKENDURL + "/comment/create", {
  //     method: "POST",
  //     body: JSON.stringify(comment_data),
  //     credentials: "include",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  // };

  console.log(payload2)
  const res = await fetch(`http://localhost:8080/post/create`, {
    method: "POST",
    body: JSON.stringify(payload2),
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
    },
});

  if (res.status !== 200) {
    throw new Error("backend responded with status: " + res.status.toString());
  }
};
