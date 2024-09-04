import React, { useEffect, useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Forward, Heart, MessageSquare } from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';
import { handleFollow, fetchSessionUser, fetchPeople } from '../lib/api';
// import ToolTipWrapper from "../ToolTipWrapper";
import Link from "next/link";


interface Person {
  user_id: string;
  user_fname: string;
  user_lname: string;
  profile_exposure: string;
  user_avatar_path: string;
  is_followed: boolean;
  is_requested: boolean;
}

const AllPeopleList = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [sessionUser, setSessionUser] = useState<string>("");
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [buttonText, setButtonText] = useState<{ [key: string]: string }>({});

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
        setSessionUser(user.User.user_id);
      } else {
        console.error(`Failed to fetch session user: ${user.status}`);
        router.push('/auth');
        return;
      }
    };

    getPeople();
    getSessionUser();

    const handleClick = () => {
      getPeople();
    };
  
    window.addEventListener('click', handleClick);
  
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [sessionUser]);

  useEffect(() => {
    const updateButtonText = () => {
      const newButtonText: { [key: string]: string } = {};
      people.forEach(person => {
        console.log("person:", person);
        if (person.user_id === sessionUser) {
          newButtonText[person.user_id] = "You";
        } else if (person.is_followed) {
          newButtonText[person.user_id] = "Unfollow";
        } else if (person.is_requested) {
          newButtonText[person.user_id] = "Follow Request Sent";
        } else {
          console.log("person.user_id:", person.user_id, "sessionUser:", sessionUser);
          newButtonText[person.user_id] = "Follow";
        }
      });
      setButtonText(newButtonText);
    };

    updateButtonText();
  }, [people, sessionUser]);

  return (
    <div className="ml-1/4 p-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-white">People ({people.length})</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person) => (
          <div key={person.user_id} className="bg-black rounded-lg overflow-hidden shadow-md text-white">
            <Link href={`/profile/${person.user_id}`} legacyBehavior>
              <a>
                <Image
                  src={person.user_avatar_path || "https://github.com/shadcn.png"}
                  alt={person.user_fname}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              </a>
            </Link>
            <div className="p-4">
              <Link href={`/profile/${person.user_id}`} legacyBehavior>
                <a>
                  <h3 className="text-lg font-semibold">{person.user_fname} {person.user_lname}</h3>
                  <div className="mt-2 text-sm">
                    <p className="text-sm text-gray-400">{person.profile_exposure}</p>
                  </div>
                </a>
              </Link>
              {/* {person.is_followed ? (
                <button className="mt-4 bg-blue-600 text-white w-full py-2 rounded"
                  onClick={() => handleFollow(person.user_id)}>
                  Unfollow
                </button>
              ) : person.is_requested ? (
                <button className="mt-4 bg-gray-600 text-white w-full py-2 rounded" disabled>
                  Follow Request Sent
                </button>
              ) : (
                <button
                  className="mt-4 bg-blue-600 text-white w-full py-2 rounded"
                  onClick={() => handleFollow(person.user_id)}
                >
                  Follow
                </button>
              )} */}
              <button
                className="mt-4 bg-blue-600 text-white w-full py-2 rounded"
                onClick={() => handleFollow(person.user_id)}
              >
                {buttonText[person.user_id]}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllPeopleList;
