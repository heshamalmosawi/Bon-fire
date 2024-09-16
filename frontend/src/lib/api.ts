import axios from "axios";
import { Profile, RequestProps, GroupEvent, BonfireEvent, Follower } from "./interfaces";

export const Yori = "http://localhost:8080";

// a function to fetch the session user
export const fetchSessionUser = async () => {
  try {
    const response = await fetch(`${Yori}/authenticate`, {
      method: "POST",
      credentials: "include",
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

// a function to fetch follow
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

// a function to fetch the follow request
export const handleFollowReq = async (userId: string, accept: boolean) => {
  try {
    const response = await fetch(`${Yori}/follow_response?user_id=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        request_type: accept ? "accept" : "reject",
      }),
      credentials: "include",
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
      method: "POST",
      credentials: "include",
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
export const handleClick = async (
  endpoint: string,
  u_id: string,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setActiveTab: (tab: string) => void,
  setData: (data: any) => void
) => {
  console.log("endpoint:", endpoint);
  setLoading(true);
  setError(null);
  setActiveTab(endpoint);
  try {
    const response = await fetch(`${Yori}/profile/${u_id}?q=${endpoint}`, {
      credentials: "include",
    });
    if (!response.ok && response.status != 403) {
      throw new Error("Network response was not ok");
    } else {
      console.log("response:", response);
      console.log("response.status:", response.status);
    }
    const result = await response.json();
    console.log("result:", result);
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
      const response = await fetch(`${Yori}/profile/${u_id}`, {
          credentials: 'include'
      });
      if (response.ok || response.status === 403) {
          const data = await response.json();
          if (data.user) {
              setProfile({
                  fname: data.user.user_fname,
                  lname: data.user.user_lname,
                  email: data.user.user_email,
                  dob: data.user.user_dob,
                  avatarUrl: data.user.user_avatar_path,
                  bio: data.user.user_about,
                  nickname: data.user.user_nickname,
                  privacy: data.user.profile_exposure,
                  is_followed: data.user.is_followed,
                  is_requested: data.user.is_requested,
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
export const fetchRequest = async (groupID: string): Promise<any[] | null> => {
  try {
    const response = await fetch(`${Yori}/requests/${groupID}`, {
      method: "GET", // Use GET to fetch data
      credentials: "include",
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
        creationDate: new Date(item.interaction_Time).toLocaleString(),
        avatarUrl: item.user_sent.userAvatarPath || "default-avatar-url.png", // Fallback for missing avatar
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
export const joinGroup = async (
  groupID: string,
  userId: string,
  accept: boolean
): Promise<boolean> => {
  console.log(`Attempting to join group ${groupID} with user ${userId}.`); // Debugging log

  try {
    const response = await fetch(`${Yori}/group/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        group_id: groupID,
        user_id: userId,
        accept: accept,
      }),
    });

    console.log("Request sent to /group/join:", {
      method: "POST",
      url: `${Yori}/group/join`,
      headers: { "Content-Type": "application/json" },
      body: { group_id: groupID, user_id: userId },
    });

    if (response.ok) {
      console.log(`User ${userId} successfully joined group ${groupID}.`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(
        "Failed to join group:",
        response.statusText,
        "Response Body:",
        errorText
      ); // Detailed error log
      return false;
    }
  } catch (error) {
    console.error(
      "Error joining group:",
      error,
      "Group ID:",
      groupID,
      "User ID:",
      userId
    ); // Detailed error log with parameters
    return false;
  }
};

// Function to fetch the groups along with membership status
export const fetchGroups = async (userId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${Yori}/groups?user_id=${userId}`, {
      method: "GET",
      credentials: "include",
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
      isMember: group.is_member || false,
      isRequested: group.is_requested,
    }));
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

// Function to leave a group
export const leaveGroup = async (
  groupID: string,
  userId: string
): Promise<boolean> => {
  console.log(`Attempting to leave group ${groupID} with user ${userId}.`); // Debugging log

  try {
    const response = await fetch(`${Yori}/group/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ group_id: groupID, user_id: userId }),
    });

    console.log("Request sent to /group/leave:", {
      method: "POST",
      url: `${Yori}/group/leave`,
      headers: { "Content-Type": "application/json" },
      body: { group_id: groupID, user_id: userId },
    });

    if (response.ok) {
      console.log(`User ${userId} successfully left group ${groupID}.`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(
        "Failed to leave group:",
        response.statusText,
        "Response Body:",
        errorText
      ); // Detailed error log
      return false;
    }
  } catch (error) {
    console.error(
      "Error leaving group:",
      error,
      "Group ID:",
      groupID,
      "User ID:",
      userId
    ); // Detailed error log with parameters
    return false;
  }
};

// Function to fetch users not in a group
export const fetchPeopleNotInGroup = async (groupID: string) => {
  try {
    const response = await fetch(`${Yori}/fetchpeople/${groupID}`, {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const users = await response.json();
      console.log("user not in group", users);
      return users;
    } else {
      console.error("Failed to fetch people not in group");
      return [];
    }
  } catch (error) {
    console.error("Error fetching people not in group:", error);
    return [];
  }
};

export const sendGroupInvite = async (
  groupID: string,
  userID: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${Yori}/group/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ group_id: groupID, user_id: userID }),
    });

    if (response.ok) {
      console.log(
        `Invitation sent successfully to user ${userID} for group ${groupID}`
      );
      return true;
    } else {
      const errorText = await response.text();
      console.error(
        `Failed to send invite: ${response.statusText}, Response Body: ${errorText}`
      );
      return false;
    }
  } catch (error) {
    console.error(`Error sending group invite: ${error}`);
    return false;
  }
};

export const fetchEventsByGroup = async (
  groupId: string
): Promise<GroupEvent[] | null> => {
  try {
    const response = await fetch(`${Yori}/events/${groupId}`, {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const events: GroupEvent[] = await response.json();
      console.log("Fetched events:", events); // Debugging log
      return events;
    } else {
      console.error("Failed to fetch events:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    return null;
  }
};

export const sendEventResponse = async (eventId: string, going: boolean) => {
  try {
    const response = await fetch("http://localhost:8080/group/event_response", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_id: eventId,
        going: going ? "yes" : "no",
      }),
    });
    if (response.ok) {
      return await response.json(); // Expecting some confirmation response from the server
    } else {
      throw new Error("Failed to submit response");
    }
  } catch (error) {
    console.error("Error submitting event response:", error);
    throw error;
  }
};

// deletes a notification
export const delNoti = async (notiID: string) => {
  await axios.delete(`${Yori}/notis/${notiID}`, {
    withCredentials: true,
  });
};

// marks all notifications as read
export const readAllNotis = async () => {
  try {
    await axios.put(
      `${Yori}/notis/read-all`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const getEventsIndex = async (): Promise<BonfireEvent[] | undefined> => {
  try {
    const res = await axios.get(`${Yori}/user-events`, {
      withCredentials: true,
    });

    if (res.status !== 200) {
      return;
    }

    return res.data
      ? res.data.map(
        (ev: any): BonfireEvent => ({
          eventID: ev.event_id,
          groupID: ev.group_id,
          eventTitle: ev.event_title,
          eventDesc: ev.event_description,
          eventDate: new Date(ev.event_timestamp),
          eventDuration: 86400000,
        })
      )
      : [];
  } catch (error) {
    console.error(error);
  }
};

export const getChatList = async (setLoading: (loading: boolean) => void, setError: (error: string | null) => void, setActiveTab: (tab: string) => void, setData: (data: any) => void) => {
  try {
    const response = await fetch(`${Yori}/getmessagelist`, {
      method: 'POST',
      credentials: 'include',
    });
    if (response.ok) {
      const result = await response.json();
      console.log("result:", result);
      setData(result);
    } else {
      throw new Error('getChatList: Network response was not ok');
    }
  } catch (error) {
    console.error("Error fetching chat list:", error);
    setError("Error fetching profile");
  } finally {
    setLoading(false);
  }
};

export const getFollowers = async (userID: string): Promise<Follower[] | undefined> => {
  try {
    const response = await fetch(`${Yori}/profile/${userID}?q=followers`, {
      credentials: "include",
    });
    if (response.ok || response.status === 403) {
      const data = await response.json();
      if (data.response) {
        return data.response.map((user: any): Follower => ({
          id: user.user_id,
          name: user.user_fname + " " + user.user_lname
        }))
      } else {
        console.error("User data is null or undefined", data);
      }
    } else {
      console.error(`Failed to fetch profile: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
}
