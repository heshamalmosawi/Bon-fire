'use client';

import React, { use, useEffect, useState } from "react";
import ProfileComponent from "@/components/desktop/ProfileComponent";
import PostComponent from "@/components/desktop/PostComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/desktop/Navbar";
import { usePathname, useRouter } from 'next/navigation';
import CommentComponent from "@/components/desktop/CommentComponent";

const ProfilePage = () => {
  const [sessionUser, setSessionUser] = useState("");
  const [profile, setProfile] = useState<{ name: string; avatarUrl: string; bio: string; nickname: string }>({ name: "", avatarUrl: "", bio: "", nickname: "" });

  const pathname = usePathname();
  const [u_id, setU_id] = useState(pathname.split("/")[2]);
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const authenticate = async () => {
      const response = await fetch(`http://localhost:8080/authenticate`, {
        method: 'POST',
        credentials: 'include',
      });
      console.log(response.status);
      if (response.status !== 200 && u_id === undefined) {
        console.log(`Failed to authenticate user: ${response.status}`);
        router.push('/auth');
        return;
      } else if (response.status === 200) { // if user is authenticated and u_id is defined in URL
        const data = await response.json();
        console.log("authentication data:", data.User.user_id);
        setSessionUser(data.User.user_id);
        if (u_id === undefined) {
          setU_id(data.User.user_id);
        }
      }
    };
    authenticate();
  }, [router]);

  // useEffect(() => {
  const handleClick = async (endpoint: string) => {
    console.log("endpoint:", endpoint);
    // const fetchData = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/profile/${u_id}/${endpoint}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      } else {
        console.log("response:", response);
        console.log("response.status:", response);
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      setError((error as any).message);
    } finally {
      setLoading(false);
    }
    // };
  };
  // }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      // TODO: find a way to get the user id from the index page or threw the url
      const response = await fetch(`http://localhost:8080/profile/${u_id}`, { credentials: 'include' });
      console.log(response.status)
      // try {
      if (response.status === 200) {
        const data = await response.json();
        console.log(data);
        if (data.user) {
          let userName = data.user.user_fname + " " + data.user.user_lname;
          console.log("user:", data.user); // TODO: delete this line
          setProfile({
            name: userName,
            avatarUrl: data.user.user_avatar_path,
            bio: data.user.user_about,
            nickname: data.user.user_nickname,
          });
        } else {
          console.error("User data is null or undefined");
        }
      } else {
        console.error(`Failed to fetch profile: ${response.status}`);
      }

    };

    fetchProfile();
    handleClick('Posts');
  }, [u_id]);

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

  return (
    // <div className="w-screen h-screen flex flex-col items-center justify-start bg-[#111]">
    //     <ProfileComponent name={profile.name} avatarUrl={profile.avatarUrl} />
    // </div>

    <div className="bg-neutral-950 min-h-screen text-gray-200">

      <div className="flex">
        <aside className="w-1/4 h-screen bg-black p-4">
          <Navbar />
        </aside>

        {/* <!-- Main Content --> */}
        {/* <ProfileComponent name={profile.name} avatarUrl={profile.avatarUrl} /> */}

        <main className="w-3/4 p-8">
          <ProfileComponent name={profile.name} avatarUrl={profile.avatarUrl} bio={profile.bio} nickname={profile.nickname} />

          <div className="flex items-start space-x-6">
            {/* <!-- Profile Info --> */}
            <div id="profile" className="relative -top-24 w-1/3 space-y-6">
              <div className="bg-black p-4 rounded-lg shadow-lg w-5/6 mx-auto">
                <Avatar className="w-32 h-32 rounded-full mx-auto">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {/* <div className="relative">
                                    <img src="https://via.placeholder.com/150" alt="Profile Picture" className="w-32 h-32 rounded-full mx-auto"></img>
                                </div> */}
                <div className="text-center mt-4">
                  <h2 className="text-2xl font-semibold">{profile.name}</h2>
                  <p className="text-gray-400">Full Stack Developer</p>
                  {sessionUser && sessionUser === u_id && <button className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-full">Edit Profile</button>}
                </div>
              </div>
              <div className="bg-black p-4 rounded-lg shadow-lg w-5/6 mx-auto">
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">About</h3>
                  <span>
                    {profile.bio}
                  </span>
                </div>
              </div>
              {/* <div className="bg-black p-4 rounded-lg shadow-lg w-5/6 mx-auto">
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-4">Photos</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <img src="https://via.placeholder.com/50" alt="Photo" className="w-full h-20 rounded-lg object-cover"></img>
                                        <img src="https://via.placeholder.com/50" alt="Photo" className="w-full h-20 rounded-lg object-cover"></img>
                                        <img src="https://via.placeholder.com/50" alt="Photo" className="w-full h-20 rounded-lg object-cover"></img>
                                        <img src="https://via.placeholder.com/50" alt="Photo" className="w-full h-20 rounded-lg object-cover"></img>
                                        <img src="https://via.placeholder.com/50" alt="Photo" className="w-full h-20 rounded-lg object-cover"></img>
                                        <img src="https://via.placeholder.com/50" alt="Photo" className="w-full h-20 rounded-lg object-cover"></img>
                                    </div>
                                </div>
                            </div> */}
            </div>

            {/* <!-- Timeline --> */}
            <div className="w-2/3 space-y-6">
              {/* <!-- Timeline Tabs --> */}
              <div className="flex space-x-6 border-b border-gray-700 pb-4">
                <button id="posts" onClick={() => handleClick('posts')} className="text-white p-2 bg-indigo-500 rounded-lg">Posts</button>
                <button id="commets" onClick={() => handleClick('comments')} className="text-gray-400 p-2">Comments</button>
                <button id="likes" onClick={() => handleClick('likes')} className="text-gray-400 p-2">Likes</button>
                <button id="followers" onClick={() => handleClick('followers')} className="text-gray-400 p-2">followers</button>
                <button id="following" onClick={() => handleClick('following')} className="text-gray-400 p-2">followings</button>
                {/* <a href="#" className="text-gray-400 p-2">About</a>
                <a href="#" className="text-gray-400 p-2">More</a> */}
              </div>
              <div className="space-y-8 ">
                <CommentComponent />
                <PostComponent />
                <PostComponent />
                <PostComponent />
                <PostComponent />
              </div>


            </div>
          </div>
        </main>
      </div>
    </div>

  );
}



export default ProfilePage;