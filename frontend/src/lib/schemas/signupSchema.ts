import { z } from "zod";
import { CheckMimeType, genRandomUsername } from "../utils";
import { HandleFileUpload } from "../handleFileUpload";
import axios from "axios";

// Schema for signup form
export const signupSchema = z
  .object({
    user_email: z.string().email("Invalid email address"),
    user_password: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
    avatar: z
      .instanceof(File)
      .refine((file) => CheckMimeType(file), {
        message: `Mime type of file unacceptable`,
      })
      .optional(),
    user_dob: z.date(),
    user_fname: z.string().min(1, "First name is required"),
    user_lname: z.string().min(1, "Last name is required"),
    user_nickname: z.string().optional(),
    user_about: z.string().optional(),
  })
  .superRefine(({ confirmPassword, user_password }, ctx) => {
    if (confirmPassword !== user_password) {
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
  try {
    console.log("we are sending");
    const avatarUrl = values.avatar
      ? await HandleFileUpload(values.avatar)
      : null;
    // Convert date to ISO string for consistent backend handling
    const payload = {
      user_email: values.user_email,
      user_password: values.user_password,
      user_fname: values.user_fname,
      user_lname: values.user_lname,
      user_dob: values.user_dob.toISOString(),
      user_avatar_path: avatarUrl,
      user_nickname: values.user_nickname ? values.user_nickname : genRandomUsername(),
      user_about: values.user_about,
      profile_exposure: "Public",
    };

    console.log("Final Payload:", payload);
    console.log("final values:", values);

    const res = await axios.post("http://localhost:8080/signup", payload, {
      withCredentials: true,
    });

    if (res.status !== 201) {
      throw new Error("Backend responded with status " + res.status);
    }

    console.log("Signup successful:", res.data);
  } catch (error) {
    console.error("Signup Submission Error:", error);
    throw error;
  }
};
