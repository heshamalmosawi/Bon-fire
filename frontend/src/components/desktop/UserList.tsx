import React, { useEffect, useState } from "react";
import { ChatSidebar } from '@/components/chat/chat-message-list';
import { ExpandableChat, ExpandableChatHeader, ExpandableChatBody } from '@/components/chat/expandable-chat';
import { ChatBubbleAvatar } from '@/components/chat/chat-bubble';
// import { Button } from '@/components/ui/button';
// import { ChatList, ChatListItem } from "@/components/chat/chat-list";
// import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/chat/chat-bubble'

interface UserListProps {
  onSelectUser: (user: User) => void;
  sessionUser: string;
}

export interface User {
  user_id: string;
  user_fname: string;
  user_lname: string;
  user_nickname?: string;
  user_profile_pic?: string;
  // user_email: string;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser, sessionUser }) => {
  const [users, setUsers] = useState<User[]>([]);  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8080/people", {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          console.log(response);
          const data = await response.json();
          setUsers(data);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);
  // delete my user from the list
  const myUser = users.findIndex((user) => user.user_id === sessionUser);
  if (myUser > -1) {
    users.splice(myUser, 1);
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    onSelectUser(user);
  };

  return (
      <div className="flex flex-col h-full bg-black">
        <ExpandableChatHeader>
          <h2 className="text-xl font-semibold">Users</h2>
        </ExpandableChatHeader>
        <ExpandableChatBody>
          <ChatSidebar chats={users.map(user => ({
            name: `${user.user_fname} ${user.user_lname}`,
            status: user.user_nickname,
            avatar: user.user_profile_pic || "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg",
            isActive: user.user_id === selectedUser?.user_id,
            onClick: () => handleUserSelect(user),
          }))} />
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