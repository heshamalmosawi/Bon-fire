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
  const payload = {
    post_content: values.textContent,
    post_image_path: values.imageContent
      ? await HandleFileUpload(values.imageContent)
      : "",
    post_exposure: "public", // TODO: fix the exposure
    group_id: "",
  };

  const res = await fetch(`http://localhost:8080/post/create`, {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status !== 200) {
    throw new Error("backend responded with status: " + res.status.toString());
  }
};
