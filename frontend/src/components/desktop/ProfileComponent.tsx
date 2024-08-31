// import React from "react";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
// import { Button } from "../ui/button";import React from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Forward, Heart, MessageSquare } from "lucide-react";
import ToolTipWrapper from "../ToolTipWrapper";
import EditProfile  from "../EditProfile";
import { fetchProfile, fetchSessionUser, handleClick} from '@/lib/api';


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

export const ProfileComponent: React.FC<ProfileProps> = ({ fname, lname, avatarUrl, bio, nickname, session_user, u_id, privacy}) => {
    return (
        <div id="profile" className="relative -top-24 w-1/3 space-y-6">
            <div className="bg-black p-4 rounded-lg shadow-lg w-5/6 mx-auto">
                <Avatar className="w-32 h-32 rounded-full mx-auto">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{nickname || fname.charAt(0) + lname.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center mt-4">
                    <h2 className="text-2xl font-semibold">{fname} {lname}</h2>
                    <p className="text-gray-400">Full Stack Developer</p>
                    {session_user && session_user === u_id && <EditProfile fname={fname} lname={lname} username={nickname} bio={bio} privacy={privacy === "Private"}/>}
                </div>
            </div>
            <div className="bg-black p-4 rounded-lg shadow-lg w-5/6 mx-auto">
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">About</h3>
                    <span>
                        {bio}
                    </span>
                </div>
            </div>
        </div>   
    );
}

interface Person {
    user_id: string;
    user_fname: string;
    user_lname: string;
    profile_exposure: string;
    user_avatar_path: string;
    is_follower: boolean;
  }
  
  interface PeopleListProps {
    onSelectPerson: (person: Person) => void;
    sessionUser: string;
    type: string;
  }

// TODO: delete the hard-coded part, call 
// const people = [
//     {
//         name: 'Carter Philips',
//         location: 'New York, USA',
//         profileViews: '11,253',
//         followers: '1,093',
//         projects: '12 Projects',
//         rating: 4.8,
//         imageSrc: '/path-to-image1.jpg',
//     },
//     {
//         name: 'Wilson Bergson',
//         location: 'New York, USA',
//         profileViews: '11,253',
//         followers: '1,093',
//         projects: '12 Projects',
//         rating: 4.8,
//         imageSrc: '/path-to-image2.jpg',
//     },
// ];

export const PeopleList: React.FC<PeopleListProps> = ({ onSelectPerson, sessionUser, type }) => {
    const [followers, setFollowers] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("");
  
    useEffect(() => {
        const fetchFollowers = async () => {
          setLoading(true);
          try {
            await handleClick(
              "followers", // endpoint
              sessionUser, // u_id
              setLoading, // setLoading
              setError, // setError
              setActiveTab, // setActiveTab
              setFollowers // setData
            );
          } catch (error) {
            console.error("Error fetching followers:", error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchFollowers();
      }, [sessionUser]);
    

    // return (
    //     <div className="min-h-screen bg-black p-6">
    //         <div className="ml-1/4 p-2">
    //             <div className="flex items-center justify-between mb-6">
    //                 <h2 className="text-2xl text-white">People (166)</h2>
    //                 {/* <button className="bg-blue-600 text-white px-4 py-2 rounded">Add New User</button> */}
    //             </div>
    //             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    //                 <div className="bg-neutral-950 rounded-lg overflow-hidden shadow-md text-white">
    //                     <Image
    //                         src="/profile1.jpg"
    //                         alt="Carter Philips"
    //                         width={300}
    //                         height={200}
    //                         className="w-full h-48 object-cover"
    //                     />
    //                     <div className="p-4">
    //                         <h3 className="text-lg font-semibold">Carter Philips</h3>
    //                         {/* <p className="text-sm text-gray-400">New York, USA</p> */}
    //                         <div className="mt-2 text-sm">
    //                             <p>Public</p>
    //                         </div>
    //                         <button className="mt-4 bg-blue-600 text-white w-full py-2 rounded">
    //                             Message
    //                         </button>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // );

  return (
    <div className="w-1/4 h-full p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-white">{type}</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul>
      {Array.isArray(followers) && followers.map((person) => (         
        <li
            key={person.user_id}
            className="p-2 text-white cursor-pointer hover:bg-gray-700"
            onClick={() => onSelectPerson(person)}
          >
            {person.user_fname + " " + person.user_lname}
          </li>
        ))}
      </ul>
    </div>
  );
}

// export ProfileComponent, PeopleList;
