import { z } from "zod";

// Schema for group creation
export const groupCreateSchema = z.object({
  groupName: z.string().trim().min(1, "Group name is required"),
  groupDescrip: z.string().trim().min(1, "Group description is required"),
});

export const HandleCreateGroup = async (
  values: z.infer<typeof groupCreateSchema>
) => {
  // Create the payload with the form values
  const payload = {
    group_name: values.groupName,
    group_desc: values.groupDescrip,
  };

  try {
    // Make a POST request to your backend API
    const response = await fetch("http://localhost:8080/group/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include", // what sends the cookie
    });
    // Check if the response is successful
    if (response.status !== 200) {
      throw new Error(
        "backend responded with status: " + response.status.toString()
      );
    }
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};
