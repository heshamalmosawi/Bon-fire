import { z } from "zod";
import { HandleFileUpload } from "../handleFileUpload";
import axios from "axios";

export const createPostSchema = z.object({
  textContent: z.string().min(5),
  imageContent: z.instanceof(File).optional(),
  groupId: z.string().optional(),
  visibility: z.string().optional(),
  selectedFollowers: z.array(z.string()).optional(),
});

export const HandleCreatePost = async (
  values: z.infer<typeof createPostSchema>
) => {
  console.log("values:", values);
  const payload = {
    post_content: values.textContent.replace(/\n/g, '\\n'),
    post_image_path: values.imageContent
      ? await HandleFileUpload(values.imageContent)
      : "",
    post_exposure: values.groupId ? "group" : values.visibility?.toLowerCase(), // handle privacy later on
    group_id: values.groupId ? values.groupId : "",
    selectedFollowers: values.selectedFollowers,
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
