"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { Group } from "@/components/desktop/groupProfile";
import PostComponent from "@/components/desktop/PostComponent";
import Navbar from "@/components/desktop/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { GroupProps, RequestProps,UserModel } from "@/lib/interfaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CreatePostForGroup from "@/components/CreatePostGroup";
import EventsList from "@/components/desktop/EventsList";
import RequestComponent from "@/components/desktop/RequestComponent";
import {
  fetchRequest,
  fetchGroups,
  joinGroup,
  fetchSessionUser,
  leaveGroup,
  fetchPeopleNotInGroup,
  sendGroupInvite
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Images } from "lucide-react";




const GroupPage = () => {
  const [sessionUser, setSessionUser] = useState<string>("");
  const [groupProfile, setGroupProfile] = useState<GroupProps>({
    groupName: "",
    ownerName: "",
    owner: "",
    ownerEmail:"",
    description: "",
    session_user: "",
    groupID: "",
    total_members: 0,
  });
  const [handledRequests, setHandledRequests] = useState<Set<string>>(
    new Set()
  );
  const [members, setMembers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]); // State for groups
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [requests, setRequests] = useState<RequestProps[]>([]);
  const pathname = usePathname();
  const [groupID, setGroupID] = useState<string>(pathname.split("/")[2]);
  const router = useRouter();
  const [nonMembers, setNonMembers] = useState<UserModel[]>([]);
  const { toast } = useToast();


useEffect(() => {
  if (activeTab === "find") {
    fetchPeopleNotInGroup(groupID).then(setNonMembers);
  }
}, [groupID, activeTab]); 

  // Function to handle the removal of requests
  const handleRequestHandled = (id: string) => {
    setHandledRequests((prev) => new Set(prev).add(id));
    setRequests((prevRequests) =>
      prevRequests.filter((request) => request.id !== id)
    );
  };

  const handleInviteClick = async (userId: string) => {
    const success = await sendGroupInvite(groupProfile.groupID, userId);
    if (success) {
      console.log("Invitation successfully sent to user:", userId);
      // Optionally update UI or show a success message
    } else {
      console.error("Failed to send invitation to user:", userId);
      toast({
        variant: "destructive",
        title: "Error sending invite",
        description: "Our servers did not create the invite properly",
      });
      // Optionally handle errors, e.g., show an error message
    }
  };
  

  const handleLeaveClick = async () => {
    const success = await leaveGroup(groupID, sessionUser);
    if (success) {
      console.log(`User ${sessionUser} left the group ${groupID}.`);
      router.push("/groups");
    } else {
      console.error("Failed to leave group.");
    }
  };

  // Function to authenticate the user
  useEffect(() => {
    const authenticate = async () => {
      try {
        const data = await fetchSessionUser();
        if (data && data.status === 200) {
          setSessionUser(data.User.user_id);
          if (!groupID) {
            setGroupID(data.User.user_id);
          }
        } else {
          router.push("/auth");
        }
      } catch (error) {
        console.error("Authentication failed:", error);
        router.push("/auth");
      }
    };
    authenticate();
  }, [router, groupID]);

  // Function to fetch group requests
  useEffect(() => {
    const getRequests = async () => {
      setLoading(true);
      try {
        const result = await fetchRequest(groupID);
        console.log("Fetched requests:", result);
        if (Array.isArray(result)) {
          setRequests(result);
        } else {
          console.error("Failed to fetch requests or incorrect data format");
          setRequests([]);
        }
      } catch (error) {
        setError("Error fetching requests");
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    getRequests();
  }, [groupID]);

  // Function to fetch all groups
  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      try {
        const fetchedGroups = await fetchGroups(sessionUser); // Fetch groups with membership info
        setGroups(fetchedGroups);
      } catch (error) {
        console.error("Failed to load groups:", error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionUser) {
      loadGroups();
    }
  }, [sessionUser]);

  // Function to handle join group logic
 

  // Function to fetch group data
  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/group/${groupID}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch group data");
      }
      const data = await response.json();

      console.log("Fetched group data:", data.members);
      console.log("Fetched owner data:", data.group_info.owner);

      if (data.group_info) {
        setGroupProfile({
          groupName: data.group_info.group_name,
          ownerName: data.group_info.owner_name || data.group_info.owner_id,
          owner: data.group_info.owner.user_nickname,
          ownerEmail:data.group_info.owner.user_email,
          description: data.group_info.group_desc,
          session_user: sessionUser,
          groupID: data.group_info.group_id,
          total_members: data.group_info.total_members,
        });

        if (data.members) setMembers(data.members);
        if (data.posts) setPosts(data.posts);
      }
    } catch (error) {
      setError((error as any).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupID]);

  const handleClick = (endpoint: string) => {
    console.log("Clicked endpoint:", endpoint);
  };

  return (
    <div className="bg-neutral-950 min-h-screen text-gray-200">
      <div className="flex">
        <Navbar />
        <main className="w-3/4 p-8">
          <div className="h-45 bg-gray-200 rounded-lg flex items-center justify-center my-6">
            {/* Placeholder content for background */}
          </div>

          {/* Group Info */}
          <Group
            groupName={groupProfile.groupName}
            ownerName={groupProfile.ownerName}
            description={groupProfile.description}
            session_user={sessionUser}
            groupID={groupProfile.groupID}
            totalMembers={groupProfile.total_members}
          />

          <CreatePostForGroup
            groupID={groupID}
            onPostCreated={fetchGroupData}
          />

          <div className="space-y-6">
            {/* Tabs for Posts, Chat, Members, Description, Events, Requests */}
            <div className="place-content-center flex space-x-9 border-b border-gray-700 pb-4">
              <button
                id="posts"
                onClick={() => setActiveTab("posts")}
                className={`p-2 rounded-lg ${
                  activeTab === "posts"
                    ? "text-white bg-indigo-500"
                    : "text-gray-400"
                }`}
              >
                Posts
              </button>
              <button
                id="chat"
                onClick={() => setActiveTab("chat")}
                className={`p-2 rounded-lg ${
                  activeTab === "chat"
                    ? "text-white bg-indigo-500"
                    : "text-gray-400"
                }`}
              >
                Chat
              </button>
              <button
                id="members"
                onClick={() => setActiveTab("members")}
                className={`p-2 rounded-lg ${
                  activeTab === "members"
                    ? "text-white bg-indigo-500"
                    : "text-gray-400"
                }`}
              >
                Members
              </button>
              <button
                id="description"
                onClick={() => setActiveTab("description")}
                className={`p-2 rounded-lg ${
                  activeTab === "description"
                    ? "text-white bg-indigo-500"
                    : "text-gray-400"
                }`}
              >
                Description
              </button>
              <button
                id="events"
                onClick={() => setActiveTab("events")}
                className={`p-2 rounded-lg ${
                  activeTab === "events"
                    ? "text-white bg-indigo-500"
                    : "text-gray-400"
                }`}
              >
                Events
              </button>

              {/* Show the "Requests" button only if the user is the owner */}
              {groupProfile.ownerName === sessionUser && (
                <button
                  id="requests"
                  onClick={() => setActiveTab("requests")}
                  className={`p-2 rounded-lg ${
                    activeTab === "requests"
                      ? "text-white bg-indigo-500"
                      : "text-gray-400"
                  }`}
                >
                  Requests
                </button>

                
              )}
              
                <button
                  id="Find members"
                  onClick={() => setActiveTab("find")}
                  className={`p-2 rounded-lg ${
                    activeTab === "find"
                      ? "text-white bg-indigo-500"
                      : "text-gray-400"
                  }`}
                >
                  Find Members
                </button>

                
       

              {/* Show the "Leave" button only if the user is not the owner */}
              {groupProfile.ownerName !== sessionUser && (
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      id="leave"
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        activeTab === "leave"
                          ? "text-white bg-indigo-500 hover:bg-black"
                          : "text-gray-400 hover:bg-black"
                      }`}
                    >
                      Leave
                    </button>
                  </SheetTrigger>

                  <SheetContent side="bottom">
                    <SheetHeader>
                      <SheetTitle>Are you absolutely sure?</SheetTitle>
                      <SheetDescription className="m-8 place-content-center">
                        Are you sure you want to leave the group?
                        <div className="mt-3 place-content-center">
                          <button
                            id="leave"
                            onClick={() => handleLeaveClick()} // Call the leave handler
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              activeTab === "leave"
                                ? "text-white bg-indigo-500 hover:bg-black"
                                : "text-gray-400 hover:bg-black"
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              )}
            </div>

            {/* Conditionally Render Content Based on Active Tab */}
            <div className="w-full space-y-8 order-last flex flex-col justify-center items-center">
              {loading && <p>Loading...</p>}
              {activeTab === "posts" &&
                posts.map((post: any) => (
                  <div className="w-6/12">
                    {" "}
                    {/* Wrapper to ensure full width */}
                    <PostComponent
                      key={post.post_id}
                      id={post.post_id}
                      firstName={post.author.user_fname}
                      lastName={post.author.user_lname}
                      username={post.author.user_nickname}
                      avatarUrl={post.author.user_avatar_path}
                      creationDate={post.created_at}
                      postTextContent={post.post_content}
                      postImageContentUrl={post.post_image_path}
                      postLikeNum={post.post_likecount}
                      postCommentNum={post.comment_count}
                      postIsLiked = {post.is_liked}
                    />
                  </div>
                ))}
              {activeTab === "chat" && <p>Chat content will appear here.</p>}
              {activeTab === "members" && (
                <div className="w-full flex flex-col items-center">
                  <div className="space-y-2 w-full px-4">
                    {/* Render Owner */}
                    <div className="w-11/12 mx-auto flex justify-between items-center p-2 border border-gray-300 rounded-lg bg-black text-white">
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarFallback>
                            {groupProfile.owner.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold pl-6">
                            {groupProfile.owner}
                          </h3>
                          <p className="text-gray-600 pl-6">{groupProfile.ownerEmail}</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-600 pr-6">Owner</p>
                    </div>

                    {/* Render Members */}
                    {members.map((member) => (
                      <div
                        key={member.user_id}
                        className="w-11/12 mx-auto flex justify-between items-center p-2 border border-gray-300 rounded-lg bg-black text-white"
                      >
                        <div className="flex items-center">
                          <Avatar>
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback>
                              {member.user_fname.charAt(0)}
                              {member.user_lname.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold pl-6">
                              {member.user_nickname}
                            </h3>
                            <p className="text-gray-600 pl-6">
                              {member.user_email}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-600 pr-6">
                          {member.user_id === groupProfile.owner
                            ? "Owner"
                            : "Member"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "description" && (
                <div>
                  <h1>{groupProfile.description}</h1>
                </div>
              )}
          {activeTab === "find" && (
  <div className="flex flex-col items-center">
    <h2 className="text-xl font-semibold">Invite Members</h2>
    <div className="w-full">
      {nonMembers.length > 0 ? (
        nonMembers.map((user) => (
          <div key={user.user_id} className="flex justify-between items-center p-2 m-2 bg-black text-white rounded-lg">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src={user.user_avatar_path || "default-avatar.png"} alt="Avatar" />
                <AvatarFallback>{user.user_fname.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <h3>{user.user_fname} {user.user_lname}</h3>
                <p className="text-gray-500">{user.user_email}</p>
              </div>
            </div>
            <button 
              onClick={() => handleInviteClick(user.user_id)}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-700 transition duration-150 ease-in-out"
            >
              Invite
            </button>
          </div>
        ))
      ) : (
        <p className="text-center text-white">No users available to invite.</p>
      )}
    </div>
  </div>
)}

              {activeTab === "events" && <EventsList />}
              {activeTab === "requests" && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {requests
                    .filter((request) => !handledRequests.has(request.id))
                    .map((request) => (
                      <RequestComponent
                        key={request.id}
                        id={request.id}
                        username={request.username}
                        creationDate={request.creationDate}
                        avatarUrl={request.avatarUrl}
                        groupID={groupProfile.groupID}
                        onRequestHandled={handleRequestHandled}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GroupPage;
