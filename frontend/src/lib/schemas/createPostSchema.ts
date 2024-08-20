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
  // const payload = {
  //   post_image_path: values.imageContent
  //     ? await HandleFileUpload(values.imageContent)
  //     : "",
  //   post_content: values.textContent,
  // };

  const payload = new FormData();

  payload.append("post_content", values.textContent);
  payload.append(
    "post_image_path",
    values.imageContent ? await HandleFileUpload(values.imageContent) : ""
  );

  const res = await axios.post("http://localhost:8080/post/create", payload, {
    withCredentials: true,
  });

  if (res.status !== 201) {
    throw new Error("backend responded with status: " + res.status.toString());
  }
};
