import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import EditProfile from "../EditProfile";
import { handleFollow } from "@/lib/api";
import { Profile } from "@/lib/interfaces";
import Link from "next/link";
import { debounce } from "@/lib/utils";

interface ProfileProps extends Profile {
  session_user: string;
  u_id: string;
  save_changes: Function;
}

export const ProfileComponent: React.FC<ProfileProps> = ({
  fname,
  lname,
  email,
  dob,
  avatarUrl,
  bio,
  nickname,
  session_user,
  u_id,
  privacy,
  is_followed,
  is_requested,
  save_changes,
}) => {
  const [followbtn_message, setFollowbtn_message] = useState("");
  console.log("is followed:", is_followed, privacy);
  console.log("is requested:", is_requested);
  useEffect(() => {
    if (session_user && session_user !== u_id) {
      if (is_followed === true) {
        setFollowbtn_message("Unfollow");
      } else {
        if (privacy === "Private") {
          if (is_requested === true) {
            setFollowbtn_message("Follow Request Sent");
          } else {
            console.log("not req:", is_requested);
            setFollowbtn_message("Request to Follow");
          }
        } else {
          setFollowbtn_message("Follow");
        }
      }
    }
  }, [is_followed, privacy, is_requested, session_user, u_id]);

  const updateFollow = async () => {
    let resp = await handleFollow(u_id);
    let follow = is_followed;
    if (resp.success) {
      // setFollowbtn_message(follow ? "Unfollow" : "Follow");
      if (privacy === "Public") {
        follow = !follow;
        save_changes({
          fname: fname,
          lname: lname,
          email: email,
          avatarUrl: avatarUrl,
          dob: dob,
          bio: bio,
          nickname: nickname,
          privacy: privacy,
          is_followed: follow,
          is_requested: false,
        });
      } else if (privacy === "Private") {
        let x = is_requested;
        if (follow) {
          follow = !follow;
          x = false;
        } else {
          x = !x;
        }
        save_changes({
          fname: fname,
          lname: lname,
          email: email,
          avatarUrl: avatarUrl,
          dob: dob,
          bio: bio,
          nickname: nickname,
          privacy: privacy,
          is_followed: follow,
          is_requested: x,
        });
      }
    }
  };

  return (
    <div id="profile" className="relative -top-24 w-1/3 space-y-6">
      <div className="bg-black p-4 rounded-lg shadow-lg w-5/6 mx-auto">
        <Avatar className="w-32 h-32 rounded-full mx-auto">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            {nickname.trim() || fname.charAt(0) + lname.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center mt-4">
          <h2 className="text-2xl font-semibold">
            {fname.trim()} {lname.trim()}
          </h2>
          <p className="text-gray-400 font-medium">
            {nickname.trim() !== "" ? `@${nickname.trim()}` : "Nickname? Who needs one!"}
          </p>
          {session_user && session_user === u_id && (
            <EditProfile
              fname={fname}
              lname={lname}
              username={nickname}
              bio={bio}
              email={email}
              dob={dob}
              privacy={privacy === "Private"}
              onEdit={save_changes}
            />
          )}
          {session_user && session_user !== u_id && (
            <button
              onClick={debounce(() => updateFollow())}
              className="mt-4 bg-indigo-500 text-white w-full py-2 rounded-full "
            >
              {followbtn_message}
            </button>
          )}
        </div>
      </div>
      <div className="bg-black p-4 rounded-lg shadow-lg w-5/6 mx-auto">
        <div className="my-1">
          <h3 className="text-lg font-semibold mb-2">Email</h3>
          <span className="mb-4">{email}</span>
          <br /> <br />
          <h3 className="text-lg font-semibold mb-2">Birthday</h3>
          <span className="mb-4">
            {new Date(dob).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <br /> <br />
          <h3 className="text-lg font-semibold mb-2">About</h3>
          <span>{bio}</span>
        </div>
      </div>
    </div>
  );
};

interface Person {
  user_id: string;
  user_fname: string;
  user_lname: string;
  profile_exposure: string;
  user_avatar_path: string;
  is_followed: boolean;
  is_requested: boolean;
  response: Array<Person>;
}

interface PeopleListProps {
  onSelectPerson: (person: Person) => void;
  session_user: string;
  save_changes: Function;
}

export const PeopleList: React.FC<PeopleListProps> = ({
  onSelectPerson,
  session_user,
  save_changes,
}) => {
  const [followers, setFollowers] = useState<Person[]>([]);
  const [followings, setFollowings] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("Followers:", followers);
  console.log("Followings:", followings);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const updateFollow = async (person: Person) => {
    let resp = await handleFollow(person.user_id);
    if (resp.success) {
      let follow = person.is_followed;
      if (person.profile_exposure === "Public") {
        person.is_followed = !follow;
        person.is_requested = false;
        if (Array.isArray(onSelectPerson)) {
          const updatedPeople = onSelectPerson.map((p) => {
            console.log();
            if (p.user_id === person.user_id) {
              return person;
            }
            return p;
          });
          save_changes({
            response: updatedPeople,
            user: { user_id: session_user },
          });
        }
      } else {
        if (person.is_followed) {
          person.is_requested = false;
          person.is_followed = false;
        } else {
          person.is_requested = true;
          person.is_followed = false;
        }
        if (Array.isArray(onSelectPerson)) {
          const updatedPeople = onSelectPerson.map((p) => {
            if (p.user_id === person.user_id) {
              return person;
            }
            return p;
          });
          save_changes({
            response: updatedPeople,
            user: { user_id: session_user },
          });
        }
      }
    }
  };

  return (
    <div className="bg-black p-6 rounded-md">
      <div className="ml-1/4 p-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-white">
            People ({onSelectPerson.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(onSelectPerson) &&
            onSelectPerson.map((person) => (
              <div
                key={person.user_id}
                className="bg-neutral-950 rounded-lg overflow-hidden shadow-md text-white"
              >
                <Link href={`/profile/${person.user_id}`} legacyBehavior>
                  <a>
                    <Avatar className="w-32 h-32 rounded-full mx-auto object-cover mt-5">
                      <AvatarImage src={person.user_avatar_path} />
                      <AvatarFallback>
                        {person.user_fname.charAt(0) +
                          person.user_lname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </a>
                </Link>
                <div className="p-4">
                  <Link href={`/profile/${person.user_id}`} legacyBehavior>
                    <a>
                      <div className="mt-2 text-sm text-center">
                        <h3 className="text-lg font-semibold">
                          {person.user_fname} {person.user_lname}
                        </h3>
                        <p className="text-gray-400 font-medium">
                          {person.profile_exposure}
                        </p>
                      </div>
                    </a>
                  </Link>
                  {person.is_followed ? (
                    <button
                      onClick={() => updateFollow(person)}
                      className="mt-4 bg-indigo-500 text-white w-full py-2 rounded-full"
                    >
                      Unfollow
                    </button>
                  ) : person.is_requested ? (
                    <button
                      onClick={() => updateFollow(person)}
                      className="mt-4 bg-indigo-500 text-white w-full py-2 rounded-full"
                    >
                      Follow Request Pending
                    </button>
                  ) : person.user_id === session_user ? (
                    <button
                      onClick={() => updateFollow(person)}
                      className="mt-4 bg-indigo-500 text-white w-full py-2 rounded-full"
                    >
                      You
                    </button>
                  ) : (
                    <button
                      onClick={() => updateFollow(person)}
                      className="mt-4 bg-indigo-500 text-white w-full py-2 rounded-full"
                    >
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
};
