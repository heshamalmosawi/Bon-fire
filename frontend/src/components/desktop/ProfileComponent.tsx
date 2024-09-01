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
import { handleFollow, fetchSessionUser, handleClick} from '@/lib/api';
import { Profile } from "@/lib/schemas/profileSchema";

interface ProfileProps extends Profile{
  session_user: string;
  u_id: string;
  save_changes: Function;
}

export const ProfileComponent: React.FC<ProfileProps> = ({ fname, lname, avatarUrl, bio, nickname, session_user, u_id, privacy, save_changes}) => {
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
                    {session_user && session_user === u_id && <EditProfile fname={fname} lname={lname} username={nickname} bio={bio} privacy={privacy === "Private"} onEdit={save_changes}/>}
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
    is_followed: boolean;
    response: Array<Person>;
}

interface PeopleListProps {
    onSelectPerson: (person: Person) => void;
    // sessionUser: string;
    // type: "Followers" | "Followings";
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

export const PeopleList: React.FC<PeopleListProps> = ({ onSelectPerson }) => {
    const [people, setPeople] = useState<Person[]>([]);
    const [followers, setFollowers] = useState<Person[]>([]);
    const [followings, setFollowings] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // const [activeTab, setActiveTab] = useState<string>("");

    // useEffect(() => {
    //     const fetchFollows = async () => {
    //         setLoading(true);
    //         // try {
    //         //     if (type === "Followers") {
    //         //         await handleClick(
    //         //             type.toLowerCase(), // endpoint
    //         //             sessionUser, // u_id
    //         //             setLoading, // setLoading
    //         //             setError, // setError
    //         //             () => { }, // setActiveTab
    //         //             setFollowers // setData
    //         //         );
    //         //     } else if (type === "Followings") {
    //         //         await handleClick(
    //         //             "followings", // endpoint
    //         //             sessionUser, // u_id
    //         //             setLoading, // setLoading
    //         //             setError, // setError
    //         //             () => { }, // setActiveTab
    //         //             setFollowings // setData
    //         //         );
    //         //     }
    //         try {
    //             const response = await handleClick(
    //                 type.toLowerCase(), // endpoint
    //                 sessionUser, // u_id
    //                 setLoading, // setLoading
    //                 setError, // setError
    //                 () => { }, // setActiveTab
    //                 setPeople // setData
    //             );
    //             // if (response && response.response) {
    //             //     setPeople(response.response);
    //             // }
    //         } catch (error) {
    //             console.error("Error fetching followers:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchFollows();
    // }, [sessionUser, type]);


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

    console.log("Followers:", followers);
    console.log("Followings:", followings);

    console.log("People:", people);
    console.log("Type of people:", typeof people);
    console.log("Is people an array:", Array.isArray(people));

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="bg-black p-6 rounded-md">
            <div className="ml-1/4 p-2">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl text-white">People  ({onSelectPerson.length})</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(onSelectPerson) && onSelectPerson.map((person) => (
                        <div key={person.user_id} className="bg-neutral-950 rounded-lg overflow-hidden shadow-md text-white">
                            <Avatar className="w-32 h-32 rounded-full mx-auto object-cover mt-5">
                                <AvatarImage src={person.user_avatar_path} />
                                <AvatarFallback>{person.user_fname.charAt(0) + person.user_lname.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold">{person.user_fname} {person.user_lname}</h3>
                                <div className="mt-2 text-sm">
                                    <p>{person.profile_exposure}</p>
                                </div>
                                {person.is_followed ? (
                                    <button onClick={() => handleFollow(person.user_id)} className="mt-4 bg-blue-600 text-white w-full py-2 rounded">
                                        Unfollow
                                    </button>
                                ) : (
                                    <button onClick={() => handleFollow(person.user_id)} className="mt-4 bg-blue-600 text-white w-full py-2 rounded">
                                        Follow
                                    </button>
                                )}
                                {/* <button className="mt-4 bg-blue-600 text-white w-full py-2 rounded" onClick={() => onSelectPerson(person)}>
                                    Message
                                </button> */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// export ProfileComponent, PeopleList;
