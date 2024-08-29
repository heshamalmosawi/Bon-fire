'use client';

import React, { useEffect, useState } from "react";
import { Group, PeopleList } from "@/components/desktop/groupProfile";
import PostComponent from "@/components/desktop/PostComponent";
import Navbar from "@/components/desktop/Navbar";
import { usePathname, useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"


const ProfilePage = () => {
  const [sessionUser, setSessionUser] = useState("");
  const [profile, setProfile] = useState<{ fname: string; lname: string; avatarUrl: string; bio: string; nickname: string; privacy: string }>({ fname: "", lname: "", avatarUrl: "", bio: "", nickname: "", privacy: "" });

  const pathname = usePathname();
  const [u_id, setU_id] = useState(pathname.split("/")[2]);
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const authenticate = async () => {
      const response = await fetch(`http://localhost:8080/authenticate`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.status !== 200 && u_id === undefined) {
        router.push('/auth');
        return;
      } else if (response.status === 200) {
        const data = await response.json();
        setSessionUser(data.User.user_id);
        if (u_id === undefined) {
          setU_id(data.User.user_id);
        }
      }
    };
    authenticate();
  }, [router]);

  const handleClick = async (endpoint: string) => {
    setLoading(true);
    // setError(null);
    setActiveTab(endpoint);
    try {
      const response = await fetch(`/profile/${u_id}/${endpoint}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      setError((error as any).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch(`http://localhost:8080/profile/${u_id}`, { credentials: 'include' });
      if (response.status === 200) {
        const data = await response.json();
        if (data.user) {
          setProfile({
            fname: data.user.user_fname,
            lname: data.user.user_lname,
            avatarUrl: data.user.user_avatar_path,
            bio: data.user.user_about,
            nickname: data.user.user_nickname,
            privacy: data.user.user_exposure
          });
        }
      } else {
        console.error(`Failed to fetch profile: ${response.status}`);
      }
    };

    fetchProfile();
    handleClick('posts');
  }, [u_id]);

  return (
    <div className="bg-neutral-950 min-h-screen text-gray-200">
      <div className="flex">
        <Navbar />
        <main className="w-3/4 p-8">
          <div className="h-45 bg-gray-200 rounded-lg flex items-center justify-center my-6">
            {/* Placeholder content for background */}
          </div>

          {/* Profile Info */}
          <Group
            fname={profile.fname}
            lname={profile.lname}
            avatarUrl={profile.avatarUrl}
            bio={profile.bio}
            nickname={profile.nickname}
            session_user={sessionUser}
            u_id={u_id}
            privacy={profile.privacy}
          />

          <div className="space-y-6">
            {/* Tabs for Posts, Comments, Members, Description */}
            <div className="place-content-center flex space-x-9 border-b border-gray-700 pb-4">
              <button
                id="posts"
                onClick={() => handleClick('posts')}
                className={`p-2 rounded-lg ${activeTab === 'posts' ? 'text-white bg-indigo-500' : 'text-gray-400'}`}
              >
                Posts
              </button>
              <button
                id="chat"
                onClick={() => handleClick('chat')}
                className={`p-2 rounded-lg ${activeTab === 'chat' ? 'text-white bg-indigo-500' : 'text-gray-400'}`}
              >
                Chat
              </button>
              <button
                id="members"
                onClick={() => handleClick('members')}
                className={`p-2 rounded-lg ${activeTab === 'members' ? 'text-white bg-indigo-500' : 'text-gray-400'}`}
              >
                Members
              </button>
              <button
                id="description"
                onClick={() => handleClick('description')}
                className={`p-2 rounded-lg ${activeTab === 'description' ? 'text-white bg-indigo-500' : 'text-gray-400'}`}
              >
                Description
              </button>

          
   {/* Leave Button and Sheet */}
   <Sheet>
        {/* Connect the button to open the sheet */}
        <SheetTrigger asChild>
          <button
            id="leave"
            onClick={() => handleClick('leave')}
            className={`p-2 rounded-lg ${activeTab === 'leave' ? 'text-white bg-indigo-500' : 'text-gray-400'}`}
          >
            Leave
          </button>
        </SheetTrigger>

        {/* Sheet content */}
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Are you absolutely sure?</SheetTitle>
            <SheetDescription className="m-8 place-content-center">
              Are you sure you want to leave the group ?
              <div className="mt-3 place-content-center">
              <button
            id="leave"
            onClick={() => handleClick('leave')}
            className={`p-2 rounded-lg ${activeTab === 'leave' ? 'text-white bg-black' : 'text-gray-400'}`}
          >
            Leave
          </button>
          </div>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
  
            </div>

            {/* Conditionally Render Content Based on Active Tab */}
            <div className="w-full space-y-8 order-last flex flex-col justify-center items-center">
              {loading && <p>Loading...</p>}
              {/* {error && <p>Error: {error}</p>} */}
              
              {activeTab === 'posts'  && (
                // data.map((post: any) => (
                
               <PostComponent id={"0"} firstName={"Noora"} lastName={"Qasim"} username={"nqasim"} avatarUrl={""} creationDate={"06/06/24"} postTextContent={"My name is noora"} postImageContentUrl={""} postLikeNum={3} postCommentNum={0} />
                )}
            

              {activeTab === 'chat' && <p>chat content will appear here.</p>}
              {activeTab === 'members' && <p>Members content will appear here.</p>}
              {activeTab === 'description' && <p>Description content will appear here.</p>}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;
