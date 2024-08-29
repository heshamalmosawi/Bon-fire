// import React from "react";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
// import { Button } from "../ui/button";import React from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Forward, Heart, MessageSquare } from "lucide-react";
import ToolTipWrapper from "../ToolTipWrapper";
import EditProfile  from "../EditGroup";


interface ProfileProps {
    fname: string;
    lname: string;
    avatarUrl: string;
    bio: string;
    nickname: string;
    session_user: string;
    u_id: string;
    privacy: string;
}

export const Group: React.FC<ProfileProps> = ({ fname, lname, avatarUrl, bio, nickname, session_user, u_id, privacy}) => {
    return (
        // <div id="profile" className="relative -top-24 w-1/3 space-y-6">
          
                 <div className="ml-1/4 p-2">
      <div className="w-[100%] h-full shadow-md mx-auto mb-8">  
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-3xl font-semibold">Group Name</h1>
          <h1 className="text-white/50 text-l font-semibold order-last">Members : 1</h1>
          <div className="flex items-center">
      
          </div>
        </div>
        <div className="w-full border-t-[0.1px] border-gray-700 mx-auto mb-8"></div>
      </div>

      <div className="w-[80%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
     
      </div>
                <div className="text-center mt-4">
                    <h2 className="text-2xl font-semibold">{fname} {lname}</h2>
                    {session_user && session_user === u_id && <EditProfile fname={fname} lname={lname} username={nickname} bio={bio} privacy={privacy === "Private"}/>}
                </div>
          
        </div>   
    );
}
    


// TODO: delete the hard-coded part, call 
const people = [
    {
        name: 'Carter Philips',
        location: 'New York, USA',
        profileViews: '11,253',
        followers: '1,093',
        projects: '12 Projects',
        rating: 4.8,
        imageSrc: '/path-to-image1.jpg',
    },
    {
        name: 'Wilson Bergson',
        location: 'New York, USA',
        profileViews: '11,253',
        followers: '1,093',
        projects: '12 Projects',
        rating: 4.8,
        imageSrc: '/path-to-image2.jpg',
    },
];

export const PeopleList = () => {
    return (
        <div className="min-h-screen bg-black p-6">
            {/* <div className="ml-1/4 p-2">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl text-white">People (166)</h2>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">Add New User</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-neutral-950 rounded-lg overflow-hidden shadow-md text-white">
                        <Image
                            src="/profile1.jpg"
                            alt="Carter Philips"
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="text-lg font-semibold">Carter Philips</h3>
                            <p className="text-sm text-gray-400">New York, USA</p>
                            <div className="mt-2 text-sm">
                                <p>Public</p>
                            </div>
                            <button className="mt-4 bg-blue-600 text-white w-full py-2 rounded">
                                Message
                            </button>
                        </div>
                    </div>
                </div>
            </div> */}
        </div>
    );
}

// export ProfileComponent, PeopleList;