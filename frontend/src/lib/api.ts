import { Profile } from "./interfaces";

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
        if (!response.ok && response.status != 403) {
            throw new Error('Network response was not ok');
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
        const response = await fetch(`${Yori}/profile/${u_id}`);
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