import { z } from "zod";
import { CheckMimeType } from "../utils"; 
import { HandleFileUpload } from '../handleFileUpload'; 
import axios from "axios";



// Schema for signup form
export const signupSchema = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  userName: z.string().nonempty("Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
  nickname: z.string().optional(),
  about: z.string().optional(),
  avatar: z.instanceof(File)
    .refine(file => CheckMimeType(file), {
      message: "Mime type of file unacceptable",
    })
    .optional(),
  dateOfBirth: z.date(),
  isPrivate: z.string().default("public"),
}).superRefine(({ confirmPassword, password }, ctx) => {
  if (confirmPassword !== password) {
    ctx.addIssue({
      code: "custom",
      message: "The passwords did not match",
      path: ["confirmPassword"],
    });
  }
});


export const HandleSignupSubmission = async (values: z.infer<typeof signupSchema>) => {
  try {
    console.log("we are sending");
    const avatarUrl = values.avatar ? await HandleFileUpload(values.avatar) : null;
    // Convert date to ISO string for consistent backend handling
    const payload = {
      ...values,
      avatar: avatarUrl,
    };

    console.log("Final Payload:", payload);
    console.log("final values:",values);

    const res = await axios.post("http://localhost:8080/signup", values, {
      withCredentials: true, 
    });

    if (res.status !== 201) {
      throw new Error("Backend responded with status " + res.status);
    }

    console.log('Signup successful:', res.data);
  } catch (error) {
    console.error("Signup Submission Error:", error);
    throw error; 
  }
};