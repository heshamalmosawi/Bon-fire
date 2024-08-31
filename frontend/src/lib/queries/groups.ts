import { Group } from "../interfaces";

export const fetchGroups = async ():Promise<Group[] | undefined> => {
  try {
    const response = await fetch("http://localhost:8080/fetchGroups");
    if (!response.ok) {
      throw new Error("Failed to fetch groups");
    }

    const data: Group[] = await response.json();

    return data
  } catch (error) {
    console.error("Error fetching groups:", error);
  }
};
