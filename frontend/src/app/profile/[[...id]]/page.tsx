'use client';

import React, { use, useEffect, useState } from "react";
import { ProfileComponent, PeopleList } from "@/components/desktop/ProfileComponent";
// import AllPeopleList from "@/components/desktop/ProfileComponent";
import PostComponent from "@/components/desktop/PostComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/desktop/Navbar";
import { usePathname, useRouter } from 'next/navigation';
import { fetchProfile, fetchSessionUser, handleClick} from '@/lib/api';
// import CommentComponent from "@/components/desktop/CommentComponent";
// import AllPeopleList from "@/components/desktop/CommentComponent";
import { Profile } from "@/lib/schemas/profileSchema";

const ProfilePage = () => {
  const [sessionUser, setSessionUser] = useState("");
  const [profile, setProfile] = useState<Profile>({ fname: "", lname: "", avatarUrl: "", bio: "", nickname: "", privacy: ""});

  const pathname = usePathname();
  const [u_id, setU_id] = useState(pathname.split("/")[2]);
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('posts');



  useEffect(() => {

    const getSessionUser = async () => {
      const data = await fetchSessionUser();
      if (!data && u_id === undefined) {
        router.push('/auth');
        return;
      } else if (data.status === 200) { // if user is authenticated and u_id is defined in URL
        // const data = await user.json();
        console.log("authentication data:", data.User.user_id);
        setSessionUser(data.User.user_id);
        console.log("u_id:", u_id);
        if (u_id === undefined) {
          setU_id(data.User.user_id);
          console.log("u_id after:", u_id, "user.user_id:", data.User.user_id);
        }
      }
    };
    getSessionUser();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!u_id){
        return;
      }
      setLoading(true);
      console.log("fetching data, u_id:", u_id);
      if (u_id !== undefined) {
      await fetchProfile(u_id, setProfile, setLoading, setError);
      handleClick('Posts', u_id, setLoading, setError, setActiveTab, setData);
      }
    };
  
    fetchData();
  }, [u_id]);

  const renderContent = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    console.log("data:", data, Array.isArray(data), data);

    switch (activeTab) {
      case 'posts':
        return data.response ? data.response.map((post: any) => (
          <PostComponent key={post.id} {...post}   firstName={data.user.user_fname} 
          lastName={data.user.user_lname} 
          username={data.user.user_nickname}  />
        )) : <p>No posts available.</p>;
      case 'comments':
        return data.response ? data.response.map((post: any) => (
          <PostComponent key={post.id} {...post}   firstName={data.user.user_fname} 
          lastName={data.user.user_lname} 
          username={data.user.user_nickname}  />
        )) : <p>No comments available</p>;
      case 'likes':
        return data.response ? data.response.map((post: any) => (
          <PostComponent key={post.id} {...post}   firstName={data.user.user_fname} 
          lastName={data.user.user_lname} 
          username={data.user.user_nickname}  />
        )) : <p>No likes available.</p>;
      case 'followers':
        return data.response ? (
          <PeopleList onSelectPerson={data.response} />
        ) : <p>No followers available.</p>;
      case 'followings':
        return data.response ? (
          <PeopleList onSelectPerson={data.response} />
        ) : <p>No followings available.</p>;
      default:  
        return null;
    }
  };

  useEffect(() => {
    const profileElement = document.getElementById("profile");
    console.log("profile element:", profileElement);

    const handleScroll = () => {
      console.log("scrolling");
      if (profileElement) {
        const rect = profileElement.getBoundingClientRect();
        if (rect.top <= 16) { // 1rem = 16px
          profileElement.classList.add("sticky");
          profileElement.classList.add("top-4");
          profileElement.classList.remove("relative");
          profileElement.classList.remove("-top-24");
        } else {
          profileElement.classList.add("relative");
          profileElement.classList.add("-top-24");
          profileElement.classList.remove("sticky");
          profileElement.classList.remove("top-4");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  // console.log("profile object:", profile);

  const updateProf = (newprof: Profile)=>{
    const x = profile.avatarUrl
    setProfile({...newprof, avatarUrl: x});
  }

  return (
    <div className="bg-neutral-950 min-h-screen text-gray-200">
      <div className="flex">
        <Navbar />
        <main className="w-3/4 p-8">
          <div className={`h-56 bg-gray-200 rounded-lg flex items-center justify-center my-8`}>
            {/* Placeholder content for background*/}
          </div>

          <div className="flex items-start space-x-6">
            {/* <!-- Profile Info --> */}
            <ProfileComponent {...profile} session_user={sessionUser} u_id={u_id} save_changes={updateProf} />


            {/* <!-- Timeline --> */}
            <div className="w-2/3 space-y-6">
              {/* <!-- Timeline Tabs --> */}
              <div className="flex space-x-6 border-b border-gray-700 pb-4">
                <button
                  id="posts"
                  onClick={() => handleClick('posts', u_id, setLoading, setError, setActiveTab, setData)}
                  className={`p-2 rounded-lg ${activeTab === 'posts' ? 'text-white bg-indigo-500' : 'text-gray-400'}`}
                >
                  Posts
                </button>
                <button
                  id="comments"
                  onClick={() => handleClick('comments', u_id, setLoading, setError, setActiveTab, setData)}
                  className={`p-2 rounded-lg ${activeTab === 'comments' ? 'text-white bg-indigo-500' : 'text-gray-400'}`}
                >
                  Comments
                </button>
                <button
                  id="likes"
                  onClick={() => handleClick('likes', u_id, setLoading, setError, setActiveTab, setData)}
                  className={`p-2 rounded-lg ${activeTab === 'likes' ? 'text-white bg-indigo-500' : 'text-gray-400'}`}
                >
                  Likes
                </button>
                <button
                  id="followers"
                  onClick={() => handleClick('followers', u_id, setLoading, setError, setActiveTab, setData)}
                  className={`p-2 rounded-lg ${activeTab === 'followers' ? 'text-white bg-indigo-500' : 'text-gray-400'}`}
                >
                  Followers
                </button>
                <button
                  id="following"
                  onClick={() => handleClick('followings', u_id, setLoading, setError, setActiveTab, setData)}
                  className={`p-2 rounded-lg ${activeTab === 'following' ? 'text-white bg-indigo-500' : 'text-gray-400'}`}
                >
                  Following
                </button>
              </div>
              <div className="space-y-8" id="timeline">
                {/* // TODO: change this so it could be a containor */}
                {/* <PeopleList /> */}
                {renderContent()}
              </div>


            </div>
          </div>
        </main>
      </div>
    </div>

  );
}



export default ProfilePage;