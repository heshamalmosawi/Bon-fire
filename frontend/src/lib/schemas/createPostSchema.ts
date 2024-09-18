import { z } from "zod";
import { HandleFileUpload } from "../handleFileUpload";
import axios from "axios";
import { CheckMimeType } from "../utils";

export const createPostSchema = z.object({
  textContent: z.string().min(5).max(180,"Post must be between 5 and 180 characters"),
  imageContent: z.instanceof(File).refine((file) => CheckMimeType(file), {
    message: `Mime type of file unacceptable`,
  }).optional(),
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
    post_exposure: values.groupId ? "group" : values.visibility,
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
