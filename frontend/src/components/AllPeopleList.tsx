import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from 'next/navigation';
import { handleFollow, fetchSessionUser, fetchPeople } from '../lib/api';
import Link from "next/link";
import { debounce } from "@/lib/utils";

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
  const [buttonText, setButtonText] = useState<{ [key: string]: string }>({});

  const router = useRouter();

  useEffect(() => {
    const getPeople = async () => {
      const data = await fetchPeople();
      if (data) {
        console.log("Data: ", data);
        setPeople(data);
      }
    };

    const getSessionUser = async () => {
      const user = await fetchSessionUser();
      if (user) {
        setSessionUser(user.User.user_id);
      } else {
        console.error("Failed to fetch session user");
        router.push("/auth");
        return;
      }
    };

    getPeople();
    getSessionUser();

  }, [sessionUser, router]);

  useEffect(() => {
    const updateButtonText = () => {
      const newButtonText: { [key: string]: string } = {};
      people.forEach(person => {
        // console.log("person: ", person);
        if (person.user_id === sessionUser) {
          newButtonText[person.user_id] = "You";
        } else if (person.is_followed) {
          newButtonText[person.user_id] = "Unfollow";
        } else if (person.is_requested) {
          newButtonText[person.user_id] = "Follow Request Sent";
        } else {
          newButtonText[person.user_id] = "Follow";
        }
      });
      setButtonText(newButtonText);
    };

    updateButtonText();
  }, [people, sessionUser]);

  const updateFollow = async (person: Person) => {
    let resp = await handleFollow(person.user_id);
    if (resp.success) {
      let follow = person.is_followed;
      if (person.profile_exposure === "Public") {
        person.is_followed = !follow;
        person.is_requested = false;
        const updatedPeople = people.map((p) => {
          if (p.user_id === person.user_id) {
            return person;
          }
          return p;
        });
        setPeople(updatedPeople);
      } else {
        person.is_requested = !person.is_requested;
        if (person.is_followed) { // converting it arbitary cause why not
          person.is_followed = false;
          person.is_requested = false;
        }
        const updatedPeople = people.map((p) => {
          if (p.user_id === person.user_id) {
            return person;
          }
          return p;
        });
        setPeople(updatedPeople);
      }
    }
  }

  return (
    <div className="ml-1/4 p-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-white">People ({people.length})</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {people.map((person) => (
          <div key={person.user_id} className="bg-black rounded-lg overflow-hidden shadow-md text-white">
            <Link href={`/profile/${person.user_id}`} legacyBehavior>
              <a>
                <Avatar className="w-32 h-32 rounded-full mx-auto object-cover mt-5">
                  <AvatarImage src={person.user_avatar_path} />
                  <AvatarFallback>{person.user_fname.charAt(0) + person.user_lname.charAt(0)}</AvatarFallback>
                </Avatar>
              </a>
            </Link>
            <div className="p-4">
              <Link href={`/profile/${person.user_id}`} legacyBehavior>
                <a>
                  <div className="mt-2 text-sm text-center">
                    <h3 className="text-lg font-semibold">{person.user_fname} {person.user_lname}</h3>
                    <p className="text-sm text-gray-400 font-medium">{person.profile_exposure}</p>
                  </div>
                </a>
              </Link>
              <button
                className={`mt-4 w-full py-2 rounded-full ${person.user_id === sessionUser ? 'text-indigo-400 font-semibold text-lg border-solid border-2 border-indigo-400' : 'bg-indigo-500 text-white'}`}
                onClick={debounce(() => updateFollow(person))}
                disabled={person.user_id === sessionUser}
              >
                {buttonText[person.user_id]}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllPeopleList;
