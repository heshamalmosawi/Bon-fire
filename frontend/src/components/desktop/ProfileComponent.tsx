import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import EditProfile  from "../EditProfile";
import { handleFollow } from '@/lib/api';
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
}

export const PeopleList: React.FC<PeopleListProps> = ({ onSelectPerson }) => {
    const [people, setPeople] = useState<Person[]>([]);
    const [followers, setFollowers] = useState<Person[]>([]);
    const [followings, setFollowings] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                                    <button onClick={() => handleFollow(person.user_id)} className="mt-4 bg-indigo-500 text-white w-full py-2 rounded">
                                        Unfollow
                                    </button>
                                ) : (
                                    <button onClick={() => handleFollow(person.user_id)} className="mt-4 bg-indigo-500 text-white w-full py-2 rounded">
                                        Follow
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
