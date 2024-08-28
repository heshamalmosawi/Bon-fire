import React, { useEffect, useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Forward, Heart, MessageSquare } from "lucide-react";
// import ToolTipWrapper from "../ToolTipWrapper";

interface Person {
  user_id: string;
  user_fname: string;
  user_lname: string;
  profile_exposure: string;
  user_avatar_path: string;
}

// const people = [
//   {
//     name: 'Carter Philips',
//     location: 'New York, USA',
//     profileViews: '11,253',
//     followers: '1,093',
//     projects: '12 Projects',
//     rating: 4.8,
//     imageSrc: '/path-to-image1.jpg',
//   },
//   {
//     name: 'Wilson Bergson',
//     location: 'New York, USA',
//     profileViews: '11,253',
//     followers: '1,093',
//     projects: '12 Projects',
//     rating: 4.8,
//     imageSrc: '/path-to-image2.jpg',
//   },
//   // Add more people as needed
// ];

const AllPeopleList = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [sessionUser, setSessionUser] = useState<string>("");
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch("http://localhost:8080/people", {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          console.log("people data:", data);
          setPeople(data);
        } else {
          console.error("Failed to fetch people");
        }
      } catch (error) {
        console.error("Error fetching people:", error);
      }
    };

    const fetchSessionUser = async () => {
      try {
        const response = await fetch("http://localhost:8080/authenticate", {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setSessionUser(data.User.user_id);
        } else {
          console.error("Failed to authenticate user");
        }
      } catch (error) {
        console.error("Error authenticating user:", error);
      }
    };

    fetchPeople();
    fetchSessionUser();
  }, []);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await fetch(`http://localhost:8080/profile/${sessionUser}?q=followings`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Following set:", data);
          setFollowing(new Set(data.map((user: { user_id: string }) => user.user_id)));
        } else {
          console.error("Failed to fetch following list");
        }
      } catch (error) {
        console.error("Error fetching following list:", error);
      }
    };

    if (sessionUser) {
      fetchFollowing();
    }
  }, [sessionUser]);

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/follow?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
        credentials: 'include',
      });
      if (response.ok) {
        setFollowing((prev) => new Set(prev).add(userId));
      } else {
        console.error("Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  return (
    // <div className="min-h-screen bg-black p-6">
    <div className="ml-1/4 p-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-white">People ({people.length})</h2>
        {/* <button className="bg-blue-600 text-white px-4 py-2 rounded">Add New User</button> */}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person) => (
          <div key={person.user_id} className="bg-black rounded-lg overflow-hidden shadow-md text-white">
            <Image
              src={person.user_avatar_path}
              alt={person.user_fname}
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{person.user_fname} {person.user_lname}</h3>
              {/* <p className="text-sm text-gray-400">New York, USA</p> */}
              <div className="mt-2 text-sm">
                <p className="text-sm text-gray-400">{person.profile_exposure}</p>
                {/* <p>Followers: 1,093</p>
                <p>Projects Done: 12 Projects</p> */}
                {/* <p className="flex items-center mt-2">
                  <span className="text-yellow-500">★ 4.8 </span>
                  <span className="text-gray-500 ml-2">(4.8 of 5.0)</span>
                </p> */}
              </div>
              {following.has(person.user_id) ? (
                <button className="mt-4 bg-blue-600 text-white w-full py-2 rounded">
                  Message
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
    // </div> 
  );
}

export default AllPeopleList;
