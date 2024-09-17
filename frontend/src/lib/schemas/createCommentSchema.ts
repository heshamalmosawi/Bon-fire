import { z } from "zod";
import { HandleFileUpload } from "../handleFileUpload";
import { CheckMimeType } from "../utils";

export const CommentCreationSchema = z.object({
  post_id: z.string().uuid(),
  comment_content: z.string().min(1, "Comment content cannot be empty").max(180, "Comment content cannot exceed 180 characters"),
  comment_image_path: z
    .instanceof(File)
    .refine((file) => CheckMimeType(file), {
      message: `Mime type of file unacceptable`,
    })
    .optional(),
});

export const HandleCommentCreation = async (
  values: z.infer<typeof CommentCreationSchema>
) => {
  console.log("comment submission invoked");

  const payload = {
    comment_image_path: values.comment_image_path
      ? await HandleFileUpload(values.comment_image_path)
      : "",
    post_id: values.post_id,
    comment_content: values.comment_content,
  };

  console.log(payload);

  const res = await fetch(`http://localhost:8080/comment/create`, {
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
