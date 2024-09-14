import React, { useEffect, useState } from "react";
import { ChatSidebar } from '@/components/chat/chat-message-list';
import { ExpandableChat, ExpandableChatHeader, ExpandableChatBody } from '@/components/chat/expandable-chat';
import { ChatBubbleAvatar } from '@/components/chat/chat-bubble';
import { notFound, usePathname, useRouter } from 'next/navigation';
import { getChatList, fetchSessionUser } from '@/lib/api';
import { set } from "animejs";
// import { Button } from '@/components/ui/button';
// import { ChatList, ChatListItem } from "@/components/chat/chat-list";
// import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/chat/chat-bubble'

interface UserListProps {
  onSelectUser: (user: User) => void;
  sessionUser: string;
  newMessageFlag: boolean;
}

export interface User {
  user_id: string;
  user_fname: string;
  user_lname: string;
  user_nickname?: string;
  user_profile_pic?: string;
  is_followed: boolean;
  // user_email: string;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser, sessionUser, newMessageFlag }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [clickCount, setClickCount] = useState(0);
  const [sessionUser1, setSessionUser] = useState("");
  const router = useRouter();
  const [NoF, SetFollowera] = useState(false);

  useEffect(() => {
    const getSessionUser = async () => {
      const data = await fetchSessionUser();
      if (!data && sessionUser === undefined) {
        router.push('/auth');
        return;
      } else if (data && data.status === 200) { // if user is authenticated and u_id is defined in URL
        console.log("authentication data:", data.User.user_id);
        setSessionUser(data.User.user_id);
        console.log("u_id:", sessionUser1);

      }
    };
    getSessionUser();
  }, [sessionUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (sessionUser != "") {
        await getChatList(setLoading, setError, setActiveTab, setData);
        if ((data && data.response === "Handling default message") || (data === null)) {
          setUsers([]);
        } else if (data && data.response === null) {
          SetFollowera(true);
          setUsers([]);
        } else {
          setUsers(data.response);
        }
      }
      // setUsers(data.response);
    };
    // if (sessionUser === "") {
    //   getSessionUser().then(user => {
    //     setSessionUser(user);
    //     fetchUsers();
    //   });
    // } else {
      // getSessionUser()
      fetchUsers();
    // }
  }, [sessionUser1, clickCount]);
  // if (sessionUser != "" && clickCount == 0) {
  //   // return <div>Loading...</div>;4
  //   setSessionUser(sessionUser);
  // }
  // delete my user from the list
  // const myUser = users.findIndex((user) => user.user_id === sessionUser);
  // if (myUser > -1) {
  //   users.splice(myUser, 1);
  // }

  useEffect(() => {
    console.log("flag has been changed", newMessageFlag);
    setTimeout(() => {
      setClickCount((prevCount) => prevCount - 1);
    }, 250);
  }, [newMessageFlag]);

  const handleClickCount = () => {
    setClickCount(prevCount => prevCount + 1);
  };

  // if (loading) {
  //   return <div>Loading...</div>;
  // }
  // if (data && data.response === "Handling default message" && users.length === 0) {
  //   setClickCount(prevCount => prevCount + 1);
  //   console.log("clickCount:", clickCount);
  // }
  // setClickCount(prevCount => prevCount + 1);
  // }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    onSelectUser(user);
  };

  return (
    <div className="flex flex-col h-full bg-black" onClick={handleClickCount} id="CHAT">
      <ExpandableChatHeader>
        <h2 className="text-xl font-semibold">Users</h2>
      </ExpandableChatHeader>
      <ExpandableChatBody>
        {NoF ? (
          <div className="w-64 bg-black p-4 flex flex-col gap-2 items-center justify-center h-full">
            <div className="text-white text-center">
              <h2 className="text-xl font-semibold mb-4">No Followers</h2>
              <p className="text-gray-400">
                You have no followers yet.
              </p>
            </div>
          </div>
        ) : ( 
          <ChatSidebar chats={users.filter(user => user.user_id !== sessionUser).map(user => ({
            name: `${user.user_fname} ${user.user_lname}`,
            status: user.user_nickname,
            avatar: user.user_profile_pic || "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg",
            isActive: user.user_id === selectedUser?.user_id,
            onClick: () => handleUserSelect(user),
          }))} />
        )}

      </ExpandableChatBody>
    </div>
    // <div className="w-1/4 h-full p-4 overflow-y-auto">
    //   <h3 className="text-lg font-semibold mb-4 text-white">Users</h3>
    //   <ul>
    //     {users.map((user) => (
    //       <li
    //         key={user.user_id}
    //         className="p-2 text-white cursor-pointer hover:bg-gray-700"
    //         onClick={() => onSelectUser(user)}
    //       >
    //         {user.user_fname + " " + user.user_lname}
    //       </li>
    //     ))}
    //   </ul>
    // </div>
  );
};

export default UserList;