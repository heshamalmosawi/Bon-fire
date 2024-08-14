import { z } from "zod";
import { CheckMimeType } from "../utils";

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
    isPrivate: z.boolean().default(true),
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
