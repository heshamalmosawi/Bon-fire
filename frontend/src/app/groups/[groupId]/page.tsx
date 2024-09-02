"use client";

import React, { useEffect, useState } from "react";
import { Group } from "@/components/desktop/groupProfile";
import PostComponent from "@/components/desktop/PostComponent";
import Navbar from "@/components/desktop/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { GroupProps, RequestProps } from "@/lib/interfaces";
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
import { fetchRequest } from "@/lib/api";

const GroupPage = () => {
  const [sessionUser, setSessionUser] = useState("");
  const [groupProfile, setGroupProfile] = useState<GroupProps>({
    groupName: "",
    ownerName: "",
    owner: "",
    description: "",
    session_user: "",
    groupID: "",
    total_members: 0,
  });

  const [members, setMembers] = useState<any[]>([]);
  const pathname = usePathname();
  const [groupID, setGroupID] = useState(pathname.split("/")[2]);
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");

  // Initialize `requests` as an empty array
  const [requests, setRequests] = useState<RequestProps[]>([]);

  useEffect(() => {
    const authenticate = async () => {
      const response = await fetch(`http://localhost:8080/authenticate`, {
        method: "POST",
        credentials: "include",
      });

      if (response.status !== 200 && groupID === undefined) {
        router.push("/auth");
        return;
      } else if (response.status === 200) {
        const data = await response.json();
        setSessionUser(data.User.user_id);
        if (groupID === undefined) {
          setGroupID(data.User.user_id);
        }
      }
    };
    authenticate();
  }, [router]);

  // Fetch group requests
  useEffect(() => {
    const getRequests = async () => {
      setLoading(true);
      try {
        const result = await fetchRequest(groupID);
        console.log("Fetched requests:", result); // Debugging log
        if (Array.isArray(result)) {
          setRequests(result); // Ensure the result is an array
        } else {
          console.error("Failed to fetch requests or incorrect data format");
          setRequests([]); // Reset requests to an empty array if the result is not an array
        }
      } catch (error) {
        setError("Error fetching requests");
        console.error("Error fetching requests:", error); // Debugging log
      } finally {
        setLoading(false);
      }
    };

    getRequests();
  }, [groupID]);

  // Fetch group data
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
      console.log("Fetched group data:", data); // Debugging log
      if (data.group_info) {
        setGroupProfile({
          groupName: data.group_info.group_name,
          ownerName: data.group_info.owner_name || data.group_info.owner_id,
          owner: data.group_info.owner.user_nickname,
          description: data.group_info.group_desc,
          session_user: sessionUser,
          groupID: data.group_info.group_id,
          total_members: data.group_info.total_members,
        });

        if (data.members) {
          setMembers(data.members);
        }

        if (data.posts != null) {
          setPosts(data.posts);
        }
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

  const handleClick = async (endpoint: string) => {
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

          <CreatePostForGroup groupID={groupID} onPostCreated={fetchGroupData} />

          <div className="space-y-6">
            {/* Tabs for Posts, Comments, Members, Description, Requests */}
            <div className="place-content-center flex space-x-9 border-b border-gray-700 pb-4">
              <button
                id="posts"
                onClick={() => setActiveTab("posts")}
                className={`p-2 rounded-lg ${
                  activeTab === "posts" ? "text-white bg-indigo-500" : "text-gray-400"
                }`}
              >
                Posts
              </button>
              <button
                id="chat"
                onClick={() => setActiveTab("chat")}
                className={`p-2 rounded-lg ${
                  activeTab === "chat" ? "text-white bg-indigo-500" : "text-gray-400"
                }`}
              >
                Chat
              </button>
              <button
                id="members"
                onClick={() => setActiveTab("members")}
                className={`p-2 rounded-lg ${
                  activeTab === "members" ? "text-white bg-indigo-500" : "text-gray-400"
                }`}
              >
                Members
              </button>
              <button
                id="description"
                onClick={() => setActiveTab("description")}
                className={`p-2 rounded-lg ${
                  activeTab === "description" ? "text-white bg-indigo-500" : "text-gray-400"
                }`}
              >
                Description
              </button>
              <button
                id="events"
                onClick={() => setActiveTab("events")}
                className={`p-2 rounded-lg ${
                  activeTab === "events" ? "text-white bg-indigo-500" : "text-gray-400"
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
                    activeTab === "requests" ? "text-white bg-indigo-500" : "text-gray-400"
                  }`}
                >
                  Requests
                </button>
              )}

              {/* Show the "Leave" button only if the user is not the owner */}
              {groupProfile.ownerName !== sessionUser && (
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      id="leave"
                      className={`p-2 rounded-lg ${
                        activeTab === "leave" ? "text-white bg-indigo-500" : "text-gray-400"
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
                            onClick={() => handleClick("leave")}
                            className={`p-2 rounded-lg ${
                              activeTab === "leave" ? "text-white bg-black" : "text-gray-400"
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
                  />
                ))}
              {activeTab === "chat" && <p>Chat content will appear here.</p>}
              {activeTab === "members" && (
                <div>
                  <h2>{groupProfile.total_members} Members</h2>
                  <h2>Owner: {groupProfile.owner}</h2>
                </div>
              )}
              {activeTab === "description" && (
                <div>
                  <h1>{groupProfile.description}</h1>
                </div>
              )}
              {activeTab === "events" && (
                <div>
                  <EventsList />
                </div>
              )}
              {activeTab === "requests" && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {requests.map((request) => (
                    <RequestComponent
                      key={request.id}
                      id={request.id}
                      username={request.username}
                      creationDate={request.creationDate}
                      avatarUrl={request.avatarUrl}
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
