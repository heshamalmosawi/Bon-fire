import { RequestProps } from "./interfaces";

export const Yori = "http://localhost:8080";

// a function to fetch the session user
export const fetchSessionUser = async () => {
    try {
        const response = await fetch(`${Yori}/authenticate`, {
            method: 'POST',
            credentials: 'include',
        });
        console.log(response.status, "api.tsx:12");
        if (response.ok) {
            const data = await response.json();
            data.status = 200;
            return data;
        } else {
            console.error("Failed to fetch session user");
            return null;
        }
    } catch (error) {
        console.error("Error fetching session user:", error);
        return null;
    }
};

// a function to fetch the follow request
export const handleFollow = async (userId: string) => {
    try {
        const response = await fetch(`${Yori}/follow?user_id=${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
            credentials: 'include',
        });
        if (response.ok) {
            return { success: true, userId };
        } else {
            console.error("Failed to follow user");
            return { success: false };
        }
    } catch (error) {
        console.error("Error following user:", error);
        return { success: false, error };
    }
};

// a function to fetch the people list
export const fetchPeople = async () => {
    try {
        const response = await fetch(`${Yori}/people`, {
            method: 'POST',
            credentials: 'include',
        });
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error("Failed to fetch people");
            return null;
        }
    } catch (error) {
        console.error("Error fetching people:", error);
        return null;
    }
};

// a function to fetch the profile user content
export const handleClick = async (endpoint: string, u_id: string, setLoading: (loading: boolean) => void, setError: (error: string | null) => void, setActiveTab: (tab: string) => void, setData: (data: any) => void) => {
    console.log("endpoint:", endpoint);
    setLoading(true);
    setError(null);
    setActiveTab(endpoint);
    try {
        const response = await fetch(`${Yori}/profile/${u_id}?q=${endpoint}`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        } else {
            console.log("response:", response);
            console.log("response.status:", response.status);
        }
        const result = await response.json();
        setData(result);
    } catch (error) {
        setError((error as any).message);
    } finally {
        setLoading(false);
    }
};

// a function to fetch the profile user 
export const fetchProfile = async (u_id: string, setProfile: (profile: Profile) => void, setLoading: (loading: boolean) => void, setError: (error: string) => void) => {
    try {
        const response = await fetch(`${Yori}/profile/${u_id}`);
        if (response.ok) {
            const data = await response.json();
            if (data.user) {
                setProfile({
                    fname: data.user.user_fname,
                    lname: data.user.user_lname,
                    avatarUrl: data.user.user_avatar_path,
                    bio: data.user.user_about,
                    nickname: data.user.user_nickname,
                    privacy: data.user.profile_exposure
                });
            } else {
                console.error("User data is null or undefined", data);
            }
        } else {
            console.error(`Failed to fetch profile: ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Error fetching profile");
    } finally {
        setLoading(false);
    }
};

// Function to fetch the group requests
export const fetchRequest = async (groupID: string): Promise<RequestProps[] | null> => {
    try {
      const response = await fetch(`${Yori}/requests/${groupID}`, {
        method: 'GET', // Use GET to fetch data
        credentials: 'include',
      });
  
      if (!response.ok) {
        console.error(`Failed to fetch group requests: ${response.statusText}`);
        return null;
      }
  
      const data = await response.json();
      console.log("Received request data:", data); // Debugging log
  
      // Ensure data is an array
      if (Array.isArray(data)) {
        return data.map((item) => ({
          id: item.user_sent.user_id,
          username: item.user_sent.user_nickname, // Ensure you map the correct fields
          creationDate: new Date(item.InteractionTime).toLocaleString(),
          avatarUrl: item.user_sent.userAvatarPath || "default-avatar-url.png" // Fallback for missing avatar
        }));
      } else {
        console.error("Unexpected data format:", data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      return null;
    }
  };
  
// Function to join a group
export const joinGroup = async (groupID: string, userId: string): Promise<boolean> => {
    console.log(`Attempting to join group ${groupID} with user ${userId}.`); // Debugging log
  
    try {
      const response = await fetch(`${Yori}/group/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ group_id: groupID, user_id: userId }),
      });
  
      console.log("Request sent to /group/join:", {
        method: 'POST',
        url: `${Yori}/group/join`,
        headers: { 'Content-Type': 'application/json' },
        body: { group_id: groupID, user_id: userId }
      });
  
      if (response.ok) {
        console.log(`User ${userId} successfully joined group ${groupID}.`);
        return true;
      } else {
        const errorText = await response.text();
        console.error("Failed to join group:", response.statusText, "Response Body:", errorText); // Detailed error log
        return false;
      }
    } catch (error) {
      console.error("Error joining group:", error, "Group ID:", groupID, "User ID:", userId); // Detailed error log with parameters
      return false;
    }
  };
  
  // Function to fetch the groups along with membership status
export const fetchGroups = async (userId: string): Promise<any[]> => {
    try {
      const response = await fetch(`${Yori}/groups?user_id=${userId}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        console.error("Failed to fetch groups:", response.statusText);
        return [];
      }
      const data = await response.json();
      return data.map((group: any) => ({
        id: group.group_id,
        name: group.group_name,
        description: group.group_desc,
        members: group.total_members,
        isMine: group.owner_id === userId,
        isMember: group.is_member || false, // Ensure the backend provides `is_member` status
      }));
    } catch (error) {
      console.error("Error fetching groups:", error);
      return [];
    }
  };
  
  // Function to leave a group
  export const leaveGroup = async (groupID: string, userId: string): Promise<boolean> => {
    console.log(`Attempting to leave group ${groupID} with user ${userId}.`); // Debugging log
  
    try {
      const response = await fetch(`${Yori}/group/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ group_id: groupID, user_id: userId }),
      });
  
      console.log("Request sent to /group/leave:", {
        method: 'POST',
        url: `${Yori}/group/leave`,
        headers: { 'Content-Type': 'application/json' },
        body: { group_id: groupID, user_id: userId }
      });
  
      if (response.ok) {
        console.log(`User ${userId} successfully left group ${groupID}.`);
        return true;
      } else {
        const errorText = await response.text();
        console.error("Failed to leave group:", response.statusText, "Response Body:", errorText); // Detailed error log
        return false;
      }
    } catch (error) {
      console.error("Error leaving group:", error, "Group ID:", groupID, "User ID:", userId); // Detailed error log with parameters
      return false;
    }
  };
  
