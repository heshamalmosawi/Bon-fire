import { z } from "zod";
import { CheckMimeType } from "../utils"; 
import { HandleFileUpload } from '../handleFileUpload'; 
import axios from "axios";

export const signupSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  userName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  nickname : z.string(),
  about : z.string(),
  avatar: z.instanceof(File).refine(file => CheckMimeType(file), {
    message: "mime type of file unacceptable"
  }).optional(),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  isPrivate: z.string().default("public"),
}).superRefine(({ confirmPassword, password }, ctx) => {
  if (confirmPassword !== password) {
    ctx.addIssue({
      code: "custom",
      message: "The passwords did not match",
      path: ["confirmPassword"]
    });
  }
});

export const HandleSignupSubmission = async (values: z.infer<typeof signupSchema>) => {
  try {
    const avatarUrl = values.avatar ? await HandleFileUpload(values.avatar) : null;
    // Convert date to ISO string for consistent backend handling
    const payload = {
      ...values,
      dateOfBirth: values.dateOfBirth.toISOString(), 
      avatar: avatarUrl,
    };

    console.log("Final Payload:", payload);

    // Send the data to the backend
    const res = await axios.post("http://localhost:8080/signup", payload, {
      withCredentials: true, // Include credentials if necessary for your backend
    });

    if (res.status !== 201) {
      throw new Error("Backend responded with status " + res.status);
    }

    console.log('Signup successful:', res.data);
  } catch (error) {
    console.error("Signup Submission Error:", error);
    throw error; // rethrow or handle as needed
  }
};