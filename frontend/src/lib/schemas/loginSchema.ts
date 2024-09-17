import { z } from "zod";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

export const loginSchema = z.object({
  email: z.string().email().min(2),
  password: z.string().min(6, "Passwords must have atleast 6 characters"),
});

export const HandleLoginSubmission = async (
  values: z.infer<typeof loginSchema>
): Promise<string | undefined> => {
  try {
    const res = await axios.post("http://localhost:8080/login", values, {
      withCredentials: true,
    });

    // save the incoming cookie
    Cookies.set("session_id", res.data.session_id);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        return "unauthorized"
      }
      return "backend responded with status " + error.code;
    }
    console.error(error);
  }
};