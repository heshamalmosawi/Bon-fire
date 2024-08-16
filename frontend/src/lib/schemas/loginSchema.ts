import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().min(2),
  password: z.string().min(6, "Passwords must have atleast 6 characters"),
});

export const HandleLoginSubmission = async (
  values: z.infer<typeof loginSchema>
) => {
  console.log(values);
};
