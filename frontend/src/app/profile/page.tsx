'use client';

import React, { useEffect, useState } from "react";
import ProfileComponent from "@/components/desktop/ProfileComponent";
import PostComponent from "@/components/desktop/PostComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const ProfilePage = () => {
    const [profile, setProfile] = useState<{ name: string; avatarUrl: string }>({ name: "", avatarUrl: "" });

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch("http://localhost:8080/profile/e", {credentials: 'include'}); // Replace 'e' with the actual user ID
            console.log(response.status)
            const data = await response.json();
            let userName = data.user.user_fname + " " + data.user.user_lname;
            console.log("user:" , data.user); // TODO: delete this line
            setProfile({
                name: userName,
                avatarUrl: data.user.user_avatar_path,
            });
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
                    {/* <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-full"></div>
              <span className="text-xl font-bold">Union UI</span>
            </div>
            <nav className="space-y-4">
              <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                <span className="iconify" data-icon="mdi:home-outline"></span>
                <span>Main Menu</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                <span className="iconify" data-icon="mdi:message-text-outline"></span>
                <span>Messages</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                <span className="iconify" data-icon="mdi:email-outline"></span>
                <span>Mail</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                <span className="iconify" data-icon="mdi:account-multiple-outline"></span>
                <span>People</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                <span className="iconify" data-icon="mdi:home-outline"></span>
                <span>Feed</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                <span className="iconify" data-icon="mdi:timeline-outline"></span>
                <span>My Timeline</span>
              </a>
            </nav>
            <hr className="my-8 border-gray-700"></hr>
            <div>
              <h3 className="text-lg font-semibold mb-4">Explore</h3>
              <nav className="space-y-4">
                <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                  <span className="iconify" data-icon="mdi:note-outline"></span>
                  <span>Pages</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                  <span className="iconify" data-icon="mdi:clipboard-outline"></span>
                  <span>Events</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                  <span className="iconify" data-icon="mdi:briefcase-outline"></span>
                  <span>Jobs</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                  <span className="iconify" data-icon="mdi:account-group-outline"></span>
                  <span>Groups</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                  <span className="iconify" data-icon="mdi:bookmark-outline"></span>
                  <span>Saved</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                  <span className="iconify" data-icon="mdi:star-outline"></span>
                  <span>Recommendations</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white">
                  <span className="iconify" data-icon="mdi:history"></span>
                  <span>Memories</span>
                </a>
              </nav>
            </div> */}
                </aside>

                {/* <!-- Main Content --> */}
                {/* <ProfileComponent name={profile.name} avatarUrl={profile.avatarUrl} /> */}

                <main className="w-3/4 p-8">
                    <ProfileComponent name={profile.name} avatarUrl={profile.avatarUrl} />

                    <div className="flex items-start space-x-6">
                        {/* <!-- Profile Info --> */}
                        <div className="sticky top-4 w-1/3 space-y-6 left-6">
                            <div className="bg-black p-4 rounded-lg shadow-lg w-5/6 mx-auto">
                                <Avatar className="w-32 h-32 rounded-full mx-auto">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                {/* <div className="relative">
                                    <img src="https://via.placeholder.com/150" alt="Profile Picture" className="w-32 h-32 rounded-full mx-auto"></img>
                                </div> */}
                                <div className="text-center mt-4">
                                    <h2 className="text-2xl font-semibold">Sayed Hesham</h2>
                                    <p className="text-gray-400">Full Stack Developer</p>
                                    <button className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-full">Edit Profile</button>
                                </div>
                            </div>
                            <div className="bg-black p-4 rounded-lg shadow-lg w-5/6 mx-auto">
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-4">About</h3>
                                    <span>
                                        I'm a UX Designer at Apple with a background in Product Design from Netflix. I studied Interaction Design at the University of America and am followed by 325 people. Originally from Kyiv, Ukraine, I bring a diverse perspective to my design work.
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