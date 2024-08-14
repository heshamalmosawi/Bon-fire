import { z } from "zod";
import { CheckMimeType } from "../utils";
import { HandleFileUpload } from "../handleFileUpload";

export const signupSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    userName: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    avatar: z
      .instanceof(File)
      .refine((file) => CheckMimeType(file), "mime type of file unacceptable") // this ensures user uplaods correct file type only
      .optional(),
    isPrivate: z.string().default("public"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export const HandleSignupSubmission = async (
  values: z.infer<typeof signupSchema>
) => {
  // check if there is an image, and then upload and take the url instead
  const payload = {
    avatar: values.avatar ? await HandleFileUpload(values.avatar) : "",
    ...values,
  };

  
};
