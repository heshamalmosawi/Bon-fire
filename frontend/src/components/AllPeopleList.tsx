import React, { useEffect, useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Forward, Heart, MessageSquare } from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';
import { handleFollow, fetchSessionUser, fetchPeople} from '../lib/api';
// import ToolTipWrapper from "../ToolTipWrapper";

interface Person {
  user_id: string;
  user_fname: string;
  user_lname: string;
  profile_exposure: string;
  user_avatar_path: string;
  is_follower: boolean;
}

const AllPeopleList = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [sessionUser, setSessionUser] = useState<string>("");
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const getPeople = async () => {
      const data = await fetchPeople();
      if (data) {
        console.log("people data:", data);
        setPeople(data);
      }
    };

    const getSessionUser = async () => {
      const user = await fetchSessionUser();
      if (user) {
        setSessionUser(user.user_id);
      } else {
        console.error(`Failed to fetch session user: ${user.status}`);
        router.push('/auth');
        return;
      }
    };

    getPeople();
    getSessionUser();
  }, []);

  return (
    <div className="ml-1/4 p-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-white">People ({people.length})</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person) => (
          <div key={person.user_id} className="bg-black rounded-lg overflow-hidden shadow-md text-white">
            <Image
              src={person.user_avatar_path || "https://github.com/shadcn.png"}
              alt={person.user_fname}
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{person.user_fname} {person.user_lname}</h3>
              <div className="mt-2 text-sm">
                <p className="text-sm text-gray-400">{person.profile_exposure}</p>
              </div>
              {person.is_follower ? (
                <button className="mt-4 bg-blue-600 text-white w-full py-2 rounded"
                  onClick={() => handleFollow(person.user_id)}>
                  UnFollow
                </button>
              ) : (
                <button
                  className="mt-4 bg-blue-600 text-white w-full py-2 rounded"
                  onClick={() => handleFollow(person.user_id)}
                >
                  Follow
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllPeopleList;
