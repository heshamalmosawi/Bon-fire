import { z } from "zod";

// Schema for group creation
export const groupCreateSchema = z.object({
  groupName: z.string().min(1, "Group name is required"),
  groupDescrip: z.string().min(1, "Group description is required"),
});


export const HandleCreateGroup = async (
    values: z.infer<typeof groupCreateSchema>
  ) => {
    // Create the payload with the form values
    const payload = {
      groupName: values.groupName,
      groupDescrip: values.groupDescrip,
    };
  
    try {
      // Make a POST request to your backend API
      const response = await fetch("http://localhost:8080/group/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), 
        credentials: "include", 
      });
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Group created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
};