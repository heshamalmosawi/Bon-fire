import { z } from "zod";
import axios from "axios";

export const loginSchema = z.object({
  email: z.string().email().min(2),
  password: z.string().min(6, "Passwords must have atleast 6 characters"),
});

export const HandleLoginSubmission = async (
  values: z.infer<typeof loginSchema>
) => {
  try {
    const res = await axios.post("http://localhost:8080/login", values, {
      withCredentials: true,
    });

    if (res.status !== 200) {
      throw new Error("backend responded with status " + res.status);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
