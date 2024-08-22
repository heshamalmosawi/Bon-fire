'use client';

import React, { useEffect, useState } from "react";
import ProfileComponent from "@/components/desktop/ProfileComponent";


const ProfilePage = () => {
    const [profile, setProfile] = useState<{ name: string; avatarUrl: string }>({ name: "", avatarUrl: "" });

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch("/api/profile/1"); // Replace '1' with the actual user ID
            const data = await response.json();
            setProfile({
                name: data.user.name,
                avatarUrl: data.user.avatarUrl,
            });
        };

        fetchProfile();
    }, []);

    return (
        // <div className="w-screen h-screen flex flex-col items-center justify-start bg-[#111]">
        //     <ProfileComponent name={profile.name} avatarUrl={profile.avatarUrl} />
        // </div>
        <div className="bg-gray-900 min-h-screen text-gray-200">

            <div className="flex">
                <aside className="w-1/4 h-screen bg-gray-800 p-4">
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
                            <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-5/6 mx-auto">
                                <div className="relative">
                                    <img src="https://via.placeholder.com/150" alt="Profile Picture" className="w-32 h-32 rounded-full mx-auto"></img>
                                    <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-sm px-2 py-1 rounded-full">
                                        Student at Reboot
                                    </div>
                                </div>
                                <div className="text-center mt-4">
                                    <h2 className="text-2xl font-semibold">Sayed Hesham</h2>
                                    <p className="text-gray-400">Full Stack Developer</p>
                                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full">Edit Profile</button>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-5/6 mx-auto">
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-4">About</h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-center space-x-3">
                                            <span className="iconify" data-icon="mdi:briefcase"></span>
                                            <span>UX Designer at Apple</span>
                                        </li>
                                        <li className="flex items-center space-x-3">
                                            <span className="iconify" data-icon="mdi:book-open-outline"></span>
                                            <span>Product Designer at Netflix</span>
                                        </li>
                                        <li className="flex items-center space-x-3">
                                            <span className="iconify" data-icon="mdi:school-outline"></span>
                                            <span>Studied Interaction Design at University of America</span>
                                        </li>
                                        <li className="flex items-center space-x-3">
                                            <span className="iconify" data-icon="mdi:account-multiple"></span>
                                            <span>Followed by 325 People</span>
                                        </li>
                                        <li className="flex items-center space-x-3">
                                            <span className="iconify" data-icon="mdi:map-marker-outline"></span>
                                            <span>From Kyiv, Ukraine</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            {/* <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-5/6 mx-auto">
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
                                <a href="#" className="text-white">Timeline</a>
                                <a href="#" className="text-gray-400">Friends</a>
                                <a href="#" className="text-gray-400">About</a>
                                <a href="#" className="text-gray-400">More</a>
                            </div>

                            {/* <!-- Posts --> */}

                            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                                <div className="flex space-x-3 mb-4">
                                    <img src="https://via.placeholder.com/50" alt="Profile Picture" className="w-12 h-12 rounded-full"></img>
                                    <div className="w-3/4">
                                        <textarea placeholder="What's New?" className="w-full bg-gray-700 text-white p-3 rounded-lg resize-none" rows={1}></textarea>
                                    </div>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-full">Post</button>

                                </div>
                                {/* <div className="flex justify-end">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-full">Post</button>
                                </div> */}
                            </div>
                            <div>
                                                            {/* <!-- Post 1 --> */}
                            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                                <div className="flex items-start space-x-3">
                                    <img src="https://via.placeholder.com/50" alt="Profile Picture" className="w-12 h-12 rounded-full"></img>
                                    <div className="w-full">
                                        <div className="flex justify-between">
                                            <h3 className="text-lg font-semibold">Sayed Hesham</h3>
                                            <span className="text-gray-400">5d</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">New York, United States</p>
                                        <p className="mt-3">I'm so glad to share with you guys some photos from my recent trip to New York. This city looks amazing, the buildings, nature, people all are beautiful. I highly recommend to visit this cool place! Also I would like to know what is your favorite place here or what you would like to visit? #fun #art #product #design #sharing</p>
                                        <div className="mt-4">
                                            <img src="https://via.placeholder.com/500x300" alt="Post Image" className="w-full h-auto rounded-lg"></img>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex space-x-4">
                                                <span className="flex items-center space-x-1">
                                                    <span className="iconify" data-icon="mdi:heart-outline"></span>
                                                    <span>925</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <span className="iconify" data-icon="mdi:message-outline"></span>
                                                    <span>23 Comments</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <span className="iconify" data-icon="mdi:share-outline"></span>
                                                    <span>4 Reposts</span>
                                                </span>
                                            </div>
                                            <span className="iconify" data-icon="mdi:dots-horizontal"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* <!-- Post 2 --> */}
                            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                                <div className="flex items-start space-x-3">
                                    <img src="https://via.placeholder.com/50" alt="Profile Picture" className="w-12 h-12 rounded-full"></img>
                                    <div className="w-full">
                                        <div className="flex justify-between">
                                            <h3 className="text-lg font-semibold">Sayed Hesham</h3>
                                            <span className="text-gray-400">5d</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">New York, United States</p>
                                        <p className="mt-3">I'm going to release my new iOS app really soon, can't wait to share it with you guys! To hear a great feedback on this!</p>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex space-x-4">
                                                <span className="flex items-center space-x-1">
                                                    <span className="iconify" data-icon="mdi:heart-outline"></span>
                                                    <span>1,253</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <span className="iconify" data-icon="mdi:message-outline"></span>
                                                    <span>45 Comments</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <span className="iconify" data-icon="mdi:share-outline"></span>
                                                    <span>6 Reposts</span>
                                                </span>
                                            </div>
                                            <span className="iconify" data-icon="mdi:dots-horizontal"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>


                        </div>
                    </div>
                </main>
            </div>
        </div>

    );
}

export default ProfilePage;