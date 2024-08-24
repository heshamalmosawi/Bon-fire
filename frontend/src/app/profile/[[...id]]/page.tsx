'use client';

import React, { useEffect, useState } from "react";
import ProfileComponent from "@/components/desktop/ProfileComponent";
import PostComponent from "@/components/desktop/PostComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/desktop/Navbar";
import { usePathname } from 'next/navigation';

const ProfilePage = () => {
  const [sessionUser, setSessionUser] = useState("");
  const [profile, setProfile] = useState<{ fname: string; lname:string; avatarUrl: string; bio: string; nickname: string; privacy: string}>({ fname: "", lname: "", avatarUrl: "", bio: "", nickname: "", privacy: ""});

  const pathname = usePathname();
  console.log("ur path", pathname);
  let u_id = pathname.split("/")[2];
  if (!u_id){
    // TODO: send request to backend endpoint to validate session, remove session if not validated
    let session_id = document.cookie.split("session_id=")[1];
    if (session_id){
      // ...
    }
    return;
  }


  useEffect(() => {
    const fetchProfile = async () => {
      // TODO: find a way to get the user id from the index page or threw the url
      const response = await fetch(`http://localhost:8080/profile/${u_id}`, { credentials: 'include' }); // Replace 'e' with the actual user ID
      console.log(response.status)
      // try {
      if (response.status === 200) {
        const data = await response.json();
        console.log(data);
        if (data.user) {
          console.log("user:", data.user); // TODO: delete this line
          setProfile({
            fname: data.user.user_fname,
            lname:data.user.user_lname,
            avatarUrl: data.user.user_avatar_path,
            bio: data.user.user_about,
            nickname: data.user.user_nickname,
            privacy: data.user.profile_exposure
          });
        } else {
          console.error("User data is null or undefined");
        }
      } else {
        console.error(`Failed to fetch profile: ${response.status}`);
      }

    };

    fetchProfile();
  }, []);
  console.log("profile object:", profile);

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
            <ProfileComponent name={profile.name} avatarUrl={profile.avatarUrl} bio={profile.bio} nickname={profile.nickname} session_user={sessionUser} u_id={u_id} />


            {/* <!-- Timeline --> */}
            <div className="w-2/3 space-y-6">
              {/* <!-- Timeline Tabs --> */}
              <div className="flex space-x-6 border-b border-gray-700 pb-4">
                <a href="#" className="text-white p-2 bg-indigo-500 rounded-lg">Timeline</a>
                <a href="#" className="text-gray-400 p-2">Friends</a>
                <a href="#" className="text-gray-400 p-2">About</a>
                <a href="#" className="text-gray-400 p-2">More</a>
              </div>
              <div className="space-y-8 ">
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